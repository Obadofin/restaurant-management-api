const orderService = require('../services/order.service');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/orders
const createOrder = asyncHandler(async(req, res) => {
    const order = await orderService.createOrder(req.user._id, req.body.items);
    res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: order,
    });
});

// GET /api/orders/me
const getMyOrders = asyncHandler(async(req, res) => {
    const orders = await orderService.getUserOrders(req.user._id);
    res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
    });
});

// GET /api/orders/admin
const getAllOrders = asyncHandler(async(req, res) => {
    const orders = await orderService.getAllOrders();
    res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
    });
});

// PATCH /api/orders/:id/status
const updateOrderStatus = asyncHandler(async(req, res) => {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status, req.user);
    res.status(200).json({
        success: true,
        message: `Order status updated to ${order.status}`,
        data: order,
    });
});

module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
};