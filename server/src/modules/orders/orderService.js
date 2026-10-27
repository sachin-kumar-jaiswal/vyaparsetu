import Product from '../products/Product.js';
import SellerProfile from '../sellers/SellerProfile.js';
import Order from './Order.js';
import Address from '../addresses/Address.js';

/**
 * Validates and executes a multi-seller checkout.
 * Groups items by seller, validates stock and pricing on the server,
 * enforces delivery PIN code coverage per seller, and creates individual orders.
 */
export const processCheckout = async ({
  buyer,
  items,
  deliveryAddressId,
  manualAddress,
  fulfilmentMethods = {}, // { [sellerId]: 'DELIVERY' | 'PICKUP' }
  paymentMethods = {},    // { [sellerId]: 'COD' | 'MANUAL_UPI' | 'DIRECT_PICKUP' }
  customerNotes = '',
}) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Your cart is empty. Please add items to checkout.');
  }

  // 1. Fetch products from database
  const productIds = items.map((i) => i.productId);
  const dbProducts = await Product.find({ _id: { $in: productIds }, status: 'ACTIVE' });
  const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

  // 2. Validate all products exist
  for (const item of items) {
    const dbProduct = productMap.get(item.productId.toString());
    if (!dbProduct) {
      throw new Error(`Product with ID ${item.productId} is no longer available.`);
    }
    if (dbProduct.stock < item.quantity) {
      throw new Error(`Insufficient stock for "${dbProduct.name}". Available: ${dbProduct.stock}, requested: ${item.quantity}.`);
    }
  }

  // 3. Resolve destination address
  let resolvedAddress = null;
  const anyDeliveryRequested = Object.values(fulfilmentMethods).some((m) => m !== 'PICKUP');

  if (deliveryAddressId) {
    const saved = await Address.findOne({ _id: deliveryAddressId, userId: buyer._id });
    if (saved) {
      resolvedAddress = {
        recipientName: saved.recipientName,
        phone: saved.phone,
        houseNo: saved.houseNo,
        street: saved.street,
        landmark: saved.landmark || '',
        city: saved.city,
        state: saved.state,
        pincode: saved.pincode,
        addressType: saved.addressType,
      };
    }
  }

  if (!resolvedAddress && manualAddress) {
    if (!manualAddress.recipientName || !manualAddress.phone || !manualAddress.houseNo || !manualAddress.street || !manualAddress.pincode) {
      throw new Error('Please provide complete address details including 6-digit PIN code.');
    }
    resolvedAddress = {
      recipientName: manualAddress.recipientName,
      phone: manualAddress.phone,
      houseNo: manualAddress.houseNo,
      street: manualAddress.street,
      landmark: manualAddress.landmark || '',
      city: manualAddress.city || 'City',
      state: manualAddress.state || 'State',
      pincode: manualAddress.pincode,
      addressType: manualAddress.addressType || 'HOME',
    };
  }

  if (anyDeliveryRequested && !resolvedAddress) {
    throw new Error('A delivery address is required for delivery orders.');
  }

  // 4. Group items by seller
  const sellerGroups = new Map();
  for (const item of items) {
    const dbProduct = productMap.get(item.productId.toString());
    const sellerIdStr = dbProduct.sellerId.toString();

    if (!sellerGroups.has(sellerIdStr)) {
      sellerGroups.set(sellerIdStr, {
        sellerId: dbProduct.sellerId,
        sellerBusinessName: dbProduct.sellerBusinessName,
        items: [],
      });
    }

    // Determine unit price based on user role and quantity tiers
    let unitPrice = dbProduct.retailPrice;
    let isWholesaleTier = false;

    if (buyer.role === 'RETAILER' && item.quantity >= dbProduct.minWholesaleQty) {
      unitPrice = dbProduct.wholesalePrice;
      isWholesaleTier = true;
    }

    // Check custom quantity tiers
    if (Array.isArray(dbProduct.quantityTiers) && dbProduct.quantityTiers.length > 0) {
      for (const tier of dbProduct.quantityTiers) {
        if (item.quantity >= tier.minQty && (tier.maxQty === null || item.quantity <= tier.maxQty)) {
          unitPrice = tier.pricePerUnit;
          isWholesaleTier = true;
          break;
        }
      }
    }

    sellerGroups.get(sellerIdStr).items.push({
      productId: dbProduct._id,
      name: dbProduct.name,
      packSizeUnit: dbProduct.packSizeUnit,
      image: dbProduct.images[0] || '/images/products/placeholder.svg',
      quantity: Number(item.quantity),
      unitPrice,
      subtotal: unitPrice * Number(item.quantity),
      isWholesaleTier,
    });
  }

  // 5. Validate PIN code coverage and delivery settings per seller
  const sellerProfiles = await SellerProfile.find({
    userId: { $in: Array.from(sellerGroups.keys()) },
  });
  const sellerProfileMap = new Map(sellerProfiles.map((p) => [p.userId.toString(), p]));

  const createdOrders = [];
  const decrementedProducts = [];

  try {
    for (const [sellerIdStr, group] of sellerGroups.entries()) {
      const sellerProfile = sellerProfileMap.get(sellerIdStr);
      const deliverySettings = sellerProfile?.deliverySettings || {
        deliveryEnabled: true,
        pickupEnabled: true,
        deliveryFee: 40,
        freeDeliveryThreshold: 499,
        serviceablePincodes: ['110001', '110002', '110003', '110004', '110005'],
        codAvailable: true,
        upiId: 'seller@upi',
      };

      const fulfilment = fulfilmentMethods[sellerIdStr] || (deliverySettings.deliveryEnabled ? 'DELIVERY' : 'PICKUP');

      // Verify delivery PIN code serviceability
      if (fulfilment === 'DELIVERY') {
        if (!deliverySettings.deliveryEnabled) {
          throw new Error(`Seller "${group.sellerBusinessName}" does not offer delivery. Please select pickup.`);
        }
        const serviceableList = deliverySettings.serviceablePincodes || [];
        if (serviceableList.length > 0 && resolvedAddress?.pincode) {
          const isServiceable = serviceableList.includes(resolvedAddress.pincode.trim());
          if (!isServiceable) {
            throw new Error(
              `Seller "${group.sellerBusinessName}" cannot deliver to PIN code ${resolvedAddress.pincode}. Available PIN codes: ${serviceableList.slice(0, 5).join(', ')}${serviceableList.length > 5 ? '...' : ''}. Please remove these items or choose pickup.`
            );
          }
        }
      } else if (fulfilment === 'PICKUP' && !deliverySettings.pickupEnabled) {
        throw new Error(`Seller "${group.sellerBusinessName}" does not support customer pickup.`);
      }

      // Calculate totals
      const subtotal = group.items.reduce((sum, i) => sum + i.subtotal, 0);
      let deliveryFee = 0;
      if (fulfilment === 'DELIVERY') {
        if (deliverySettings.freeDeliveryThreshold && subtotal >= deliverySettings.freeDeliveryThreshold) {
          deliveryFee = 0;
        } else {
          deliveryFee = deliverySettings.deliveryFee || 0;
        }
      }
      const grandTotal = subtotal + deliveryFee;

      // Payment method validation
      const paymentMethod = paymentMethods[sellerIdStr] || (deliverySettings.codAvailable ? 'COD' : 'MANUAL_UPI');
      if (paymentMethod === 'COD' && !deliverySettings.codAvailable) {
        throw new Error(`Seller "${group.sellerBusinessName}" does not accept Cash on Delivery.`);
      }

      // Generate unique order number
      const orderNumber = `VS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      // Decrement stock safely
      for (const item of group.items) {
        const updated = await Product.findOneAndUpdate(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
        if (!updated) {
          throw new Error(`Item "${item.name}" ran out of stock during checkout. Please adjust your cart.`);
        }
        decrementedProducts.push({ productId: item.productId, quantity: item.quantity });
      }

      // Create Order in DB
      const order = await Order.create({
        orderNumber,
        buyerId: buyer._id,
        buyerName: buyer.name,
        buyerEmail: buyer.email,
        buyerPhone: buyer.phone,
        buyerRole: buyer.role,
        sellerId: group.sellerId,
        sellerBusinessName: group.sellerBusinessName,
        items: group.items,
        subtotal,
        deliveryFee,
        grandTotal,
        fulfilmentMethod: fulfilment,
        deliveryAddress: fulfilment === 'DELIVERY' ? resolvedAddress : null,
        paymentMethod,
        paymentStatus: 'PENDING_VERIFICATION',
        paymentDetails: {
          sellerUpiId: deliverySettings.upiId || '',
          notes: customerNotes || '',
        },
        orderStatus: 'PENDING',
        statusHistory: [
          {
            status: 'PENDING',
            note: `Order placed with ${paymentMethod} payment via ${fulfilment.toLowerCase()}.`,
            updatedAt: new Date(),
            updatedBy: 'BUYER',
          },
        ],
      });

      createdOrders.push(order);
    }

    return createdOrders;
  } catch (error) {
    // Rollback any stock already decremented in this batch
    for (const item of decrementedProducts) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }
    // Delete any orders created in this batch
    for (const order of createdOrders) {
      await Order.findByIdAndDelete(order._id);
    }
    throw error;
  }
};
