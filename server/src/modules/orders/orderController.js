import Order from './Order.js';
import Product from '../products/Product.js';
import { processCheckout } from './orderService.js';

export const checkout = async (req, res, next) => {
  try {
    const { items, deliveryAddressId, manualAddress, fulfilmentMethods, paymentMethods, customerNotes } = req.body;

    const orders = await processCheckout({
      buyer: req.user,
      items,
      deliveryAddressId,
      manualAddress,
      fulfilmentMethods,
      paymentMethods,
      customerNotes,
    });

    res.status(201).json({
      success: true,
      message: `Checkout successful! Created ${orders.length} seller ${orders.length === 1 ? 'order' : 'orders'}.`,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = { buyerId: req.user._id };

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Access control: only buyer, seller, or super admin can view
    const isBuyer = order.buyerId.toString() === req.user._id.toString();
    const isSeller = order.sellerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'SUPER_ADMIN';

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const getSellerOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, page = 1, limit = 20 } = req.query;
    const query = { sellerId: req.user._id };

    if (status && status !== 'all') query.orderStatus = status;
    if (paymentStatus && paymentStatus !== 'all') query.paymentStatus = paymentStatus;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this order.' });
    }

    const validStatuses = [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'READY_FOR_DISPATCH',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'READY_FOR_PICKUP',
      'COLLECTED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      note: note || `Order marked as ${status} by seller.`,
      updatedAt: new Date(),
      updatedBy: req.user.role,
    });

    // If order was cancelled by seller, restock items
    if (status === 'CANCELLED' && order.orderStatus !== 'CANCELLED') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const submitUtr = async (req, res, next) => {
  try {
    const { utrReference } = req.body;
    if (!utrReference || utrReference.trim().length < 4) {
      return res.status(400).json({ success: false, message: 'Please provide a valid UTR / transaction reference number.' });
    }

    const order = await Order.findOne({ _id: req.params.id, buyerId: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.paymentDetails.utrReference = utrReference.trim();
    order.paymentDetails.submittedAt = new Date();
    order.statusHistory.push({
      status: order.orderStatus,
      note: `Buyer submitted UPI payment reference: ${utrReference.trim()}`,
      updatedAt: new Date(),
      updatedBy: 'BUYER',
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment reference submitted. The wholesaler will verify receipt shortly.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { isVerified, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to verify this payment.' });
    }

    if (isVerified) {
      order.paymentStatus = 'PAID';
      order.paymentDetails.verifiedAt = new Date();
      order.paymentDetails.verifiedBy = req.user.name;
      order.paymentDetails.notes = notes || 'Payment verified by seller';
      order.statusHistory.push({
        status: order.orderStatus,
        note: `Payment verified as PAID by ${req.user.name}.`,
        updatedAt: new Date(),
        updatedBy: req.user.role,
      });
    } else {
      order.paymentStatus = 'PENDING_VERIFICATION';
      order.paymentDetails.notes = notes || 'Payment verification rejected or pending recheck';
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: isVerified ? 'Payment marked as verified.' : 'Payment updated as pending.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const requestCancellation = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ _id: req.params.id, buyerId: req.user._id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.orderStatus === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled.' });
    }

    if (['DELIVERED', 'COLLECTED'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Completed orders cannot be cancelled. You can report an issue instead.' });
    }

    // If order is still PENDING, allow instant cancellation
    if (order.orderStatus === 'PENDING') {
      order.orderStatus = 'CANCELLED';
      order.cancellation = {
        isRequested: true,
        reason: reason || 'Cancelled by buyer before processing',
        status: 'APPROVED',
        requestedAt: new Date(),
        processedAt: new Date(),
        processedBy: 'SYSTEM_AUTO',
      };
      // Restock items
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
      }
      order.statusHistory.push({
        status: 'CANCELLED',
        note: `Cancelled by buyer. Reason: ${reason || 'Not specified'}`,
        updatedAt: new Date(),
        updatedBy: 'BUYER',
      });
    } else {
      // Order is already CONFIRMED/PROCESSING -> requires seller response
      order.cancellation = {
        isRequested: true,
        reason: reason || 'Buyer requested cancellation',
        status: 'REQUESTED',
        requestedAt: new Date(),
      };
      order.statusHistory.push({
        status: order.orderStatus,
        note: `Buyer requested cancellation: ${reason || 'Not specified'}`,
        updatedAt: new Date(),
        updatedBy: 'BUYER',
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: order.orderStatus === 'CANCELLED' ? 'Order cancelled successfully.' : 'Cancellation request sent to seller for confirmation.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const respondCancellation = async (req, res, next) => {
  try {
    const { approve, responseNote } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (!order.cancellation.isRequested) {
      return res.status(400).json({ success: false, message: 'No pending cancellation request for this order.' });
    }

    if (approve) {
      order.orderStatus = 'CANCELLED';
      order.cancellation.status = 'APPROVED';
      order.cancellation.processedAt = new Date();
      order.cancellation.processedBy = req.user.name;
      order.cancellation.responseNote = responseNote || 'Cancellation approved by seller';

      // Restock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
      }

      order.statusHistory.push({
        status: 'CANCELLED',
        note: `Cancellation approved by seller. ${responseNote || ''}`,
        updatedAt: new Date(),
        updatedBy: req.user.role,
      });
    } else {
      order.cancellation.status = 'REJECTED';
      order.cancellation.processedAt = new Date();
      order.cancellation.processedBy = req.user.name;
      order.cancellation.responseNote = responseNote || 'Cancellation rejected by seller';
      order.statusHistory.push({
        status: order.orderStatus,
        note: `Cancellation request declined. Reason: ${responseNote || 'Order already dispatched/prepared'}`,
        updatedAt: new Date(),
        updatedBy: req.user.role,
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: approve ? 'Order cancelled and inventory restored.' : 'Cancellation request declined.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const reportReturnIssue = async (req, res, next) => {
  try {
    const { issueType, description } = req.body;
    const order = await Order.findOne({ _id: req.params.id, buyerId: req.user._id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (!['DELIVERED', 'COLLECTED'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Issues can only be reported for delivered or collected orders.' });
    }

    order.returnIssue = {
      isReported: true,
      issueType: issueType || 'DAMAGED_ITEM',
      description: description || 'Issue reported by customer',
      status: 'PENDING_REVIEW',
      reportedAt: new Date(),
    };

    order.statusHistory.push({
      status: order.orderStatus,
      note: `Customer reported issue: [${issueType}] ${description || ''}`,
      updatedAt: new Date(),
      updatedBy: 'BUYER',
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Issue report submitted to wholesaler and administration.',
      order,
    });
  } catch (error) {
    next(error);
  }
};
