import BulkInquiry from './BulkInquiry.js';
import Order from '../orders/Order.js';
import SellerProfile from '../sellers/SellerProfile.js';

export const createInquiry = async (req, res, next) => {
  try {
    const {
      productOrCategory,
      requestedQty,
      requiredDate,
      deliveryPincode,
      deliveryAddressText,
      budget,
      additionalRequirements,
    } = req.body;

    if (!productOrCategory || !requestedQty || !requiredDate || !deliveryPincode || !deliveryAddressText) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product/category, quantity, required date, delivery PIN code, and delivery address.',
      });
    }

    const inquiryNumber = `INQ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const inquiry = await BulkInquiry.create({
      inquiryNumber,
      requesterId: req.user._id,
      requesterName: req.user.name,
      requesterEmail: req.user.email,
      requesterPhone: req.user.phone,
      requesterRole: req.user.role,
      productOrCategory,
      requestedQty: Number(requestedQty),
      requiredDate: new Date(requiredDate),
      deliveryPincode: deliveryPincode.trim(),
      deliveryAddressText,
      budget: Number(budget) || 0,
      additionalRequirements: additionalRequirements || '',
      status: 'SUBMITTED',
    });

    res.status(201).json({
      success: true,
      message: 'Bulk inquiry submitted! Wholesalers in our network will review and send quotations.',
      inquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyInquiries = async (req, res, next) => {
  try {
    const inquiries = await BulkInquiry.find({ requesterId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      inquiries,
    });
  } catch (error) {
    next(error);
  }
};

export const getMarketInquiries = async (req, res, next) => {
  try {
    // Wholesalers view active open inquiries
    const inquiries = await BulkInquiry.find({
      status: { $in: ['SUBMITTED', 'QUOTED'] },
    }).sort({ createdAt: -1 }).limit(50);

    res.status(200).json({
      success: true,
      inquiries,
    });
  } catch (error) {
    next(error);
  }
};

export const submitQuotation = async (req, res, next) => {
  try {
    const { proposedQty, unitPrice, deliveryFee, estimatedDays, quotationNotes } = req.body;
    const inquiry = await BulkInquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }

    if (!proposedQty || unitPrice === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide proposed quantity and unit price.' });
    }

    const sellerProfile = await SellerProfile.findOne({ userId: req.user._id });
    const sellerBusinessName = sellerProfile?.businessName || req.user.name;

    const unitPriceNum = Number(unitPrice);
    const qtyNum = Number(proposedQty);
    const feeNum = Number(deliveryFee) || 0;
    const totalPrice = (unitPriceNum * qtyNum) + feeNum;

    // Check if seller already quoted, update quote if so
    const existingIndex = inquiry.quotes.findIndex(q => q.sellerId.toString() === req.user._id.toString());
    const quotePayload = {
      sellerId: req.user._id,
      sellerBusinessName,
      proposedQty: qtyNum,
      unitPrice: unitPriceNum,
      totalPrice,
      deliveryFee: feeNum,
      estimatedDays: estimatedDays || '2-3 Business Days',
      quotationNotes: quotationNotes || '',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'OFFERED',
      createdAt: new Date(),
    };

    if (existingIndex >= 0) {
      inquiry.quotes[existingIndex] = quotePayload;
    } else {
      inquiry.quotes.push(quotePayload);
    }

    inquiry.status = 'QUOTED';
    await inquiry.save();

    res.status(200).json({
      success: true,
      message: 'Quotation submitted successfully to the buyer.',
      inquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptQuotation = async (req, res, next) => {
  try {
    const { quotationId, paymentMethod = 'COD' } = req.body;
    const inquiry = await BulkInquiry.findOne({ _id: req.params.id, requesterId: req.user._id });

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }

    const quote = inquiry.quotes.find(q => q._id?.toString() === quotationId || q.quotationId === quotationId);
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    // Mark winning quote and others
    for (const q of inquiry.quotes) {
      if (q._id?.toString() === quote._id?.toString() || q.quotationId === quote.quotationId) {
        q.status = 'ACCEPTED';
      } else {
        q.status = 'REJECTED';
      }
    }

    inquiry.status = 'ACCEPTED';
    inquiry.acceptedQuotationId = quote.quotationId;

    // Create real validated Order for this accepted bulk quote
    const orderNumber = `VS-BULK-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = await Order.create({
      orderNumber,
      buyerId: req.user._id,
      buyerName: req.user.name,
      buyerEmail: req.user.email,
      buyerPhone: req.user.phone,
      buyerRole: req.user.role,
      sellerId: quote.sellerId,
      sellerBusinessName: quote.sellerBusinessName,
      items: [
        {
          productId: quote.sellerId, // linked to seller
          name: `Bulk: ${inquiry.productOrCategory}`,
          packSizeUnit: `${quote.proposedQty} units`,
          image: '/images/products/placeholder.svg',
          quantity: quote.proposedQty,
          unitPrice: quote.unitPrice,
          subtotal: quote.unitPrice * quote.proposedQty,
          isWholesaleTier: true,
        },
      ],
      subtotal: quote.unitPrice * quote.proposedQty,
      deliveryFee: quote.deliveryFee || 0,
      grandTotal: quote.totalPrice,
      fulfilmentMethod: 'DELIVERY',
      deliveryAddress: {
        recipientName: req.user.name,
        phone: req.user.phone,
        houseNo: 'Bulk Delivery Location',
        street: inquiry.deliveryAddressText,
        landmark: '',
        city: 'City',
        state: 'State',
        pincode: inquiry.deliveryPincode,
        addressType: 'WORK',
      },
      paymentMethod,
      paymentStatus: 'PENDING_VERIFICATION',
      orderStatus: 'CONFIRMED',
      statusHistory: [
        {
          status: 'CONFIRMED',
          note: `Order confirmed via Bulk Inquiry Quotation ${quote.quotationId}.`,
          updatedAt: new Date(),
          updatedBy: 'BUYER',
        },
      ],
    });

    inquiry.resultingOrderId = order._id;
    await inquiry.save();

    res.status(200).json({
      success: true,
      message: 'Quotation accepted and order created successfully!',
      order,
      inquiry,
    });
  } catch (error) {
    next(error);
  }
};
