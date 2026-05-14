// Import order-related business logic
const orderService = require('../services/order.service');

// Wrapper for automatically handling async errors
const asyncHandler = require('../utils/asyncHandler');

// Standard HTTP status codes (200, 201, etc.)
const { StatusCodes } = require('http-status-codes');


// ======================= CREATE ORDER =======================
// POST /api/orders
const createOrder = asyncHandler(async(req, res) => {

    // Create a new order using logged-in user's ID and selected items
    const order = await orderService.createOrder(
        req.user._id,
        req.body.items
    );

    // Send success response with created order
    res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Order created successfully",
        data: order,
    });
});



// ======================= GET LOGGED-IN USER ORDERS =======================
// GET /api/orders/me
const getMyOrders = asyncHandler(async(req, res) => {

    // Fetch all orders belonging to the logged-in user
    const orders = await orderService.getUserOrders(req.user._id);

    // Send user's orders back to the client
    res.status(StatusCodes.OK).json({
        success: true,

        // Total number of orders
        count: orders.length,

        data: orders,
    });
});


// ======================= GET ALL ORDERS =======================
// GET /api/orders/admin
const getAllOrders = asyncHandler(async(req, res) => {

    // Fetch all orders from the database
    const orders = await orderService.getAllOrders();

    // Send all orders back to the client
    res.status(StatusCodes.OK).json({
        success: true,

        // Total number of orders
        count: orders.length,

        data: orders,
    });
});


// ======================= UPDATE ORDER STATUS =======================
// PATCH /api/orders/:id/status
const updateOrderStatus = asyncHandler(async(req, res) => {

    // Update the status of a specific order
    const order = await orderService.updateOrderStatus(
        req.params.id,      // Order ID from URL
        req.body.status,    // New status from request body
        req.user            // Logged-in user performing the update
    );

    // Send updated order back to the client
    res.status(StatusCodes.OK).json({
        success: true,
        message: `Order status updated to ${order.status}`,
        data: order,
    });
});


// Export all controller functions
module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
};