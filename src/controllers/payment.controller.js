const crypto = require("crypto");
const Payment = require("../models/payment.model");
const Order = require("../models/order.model");
const asyncHandler = require("../utils/asyncHandler");
const { StatusCodes } = require("http-status-codes");
const { PAYMENT_STATUS } = require("../core/constants");

// POST /api/payments/process
exports.processPayment = asyncHandler(async (req, res) => {
  const { order: orderId, paymentMethod } = req.body;
  let { amount } = req.body;

  // If an order is provided, use its totalPrice as the authoritative amount
  if (orderId) {
    const order = await Order.findById(orderId);

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = StatusCodes.NOT_FOUND;
      throw error;
    }

    amount = order.totalPrice;
  }

  const payment = await Payment.create({
    user: req.user._id,
    order: orderId || undefined,
    amount,
    paymentMethod,
    status: PAYMENT_STATUS.SUCCESS,
    transactionId: crypto.randomUUID(),
    processedAt: new Date(),
  });

  await payment.populate("user", "name email");
  if (payment.order) {
    await payment.populate("order", "status totalPrice");
  }

  res.status(StatusCodes.CREATED).json({ success: true, data: payment });
});

// GET /api/payments/me
exports.getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id }).populate("order", "status totalPrice").sort({ processedAt: -1 });

  res.status(StatusCodes.OK).json({ success: true, data: payments });
});

// GET /api/payments (admin only)
exports.getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find().populate("user", "name email").populate("order", "status totalPrice").sort({ processedAt: -1 });

  res.status(StatusCodes.OK).json({ success: true, data: payments });
});
