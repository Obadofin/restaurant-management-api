const Order = require('../models/order.model');
const MenuItem = require('../models/menu.model'); 
const { ROLES } = require("../core/constants");
const { StatusCodes } = require('http-status-codes');


// Define valid status transitions
const validateAndEnrichItems = async (requestedItems) => {
    const ids = requestedItems.map((item)=> item.menuItemId);
    const menuItems = await MenuItem.find({_id: {$in: ids}});

    const menuItemMap = new Map(
        menuItems.map((m)=> [m._id.toString(), m])
    );

    const errors = [];
    const enriched = requestedItems.map((item)=>{
        const found = menuItemMap.get(item.menuItemId.toString());

        if(!found){
            errors.push(`Menu item  ${item.menuItemId} does not exist`);
            return null;
        }
        if(!found.isAvailable){
            errors.push(`Menu item "${found.name}" is currently unavailable `);
            return null;
        }

        return {
            menuItemId: found._id,
            name: found.name,
            quantity: item.quantity,
            unitPrice: found.price,
            subTotal: 0, // will be calculated in pre-save hook
        };
    });

    if(errors.length > 0){
        const error = new Error(errors.join("; "));
        error.statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
        throw error;
    }

    return enriched;
};


// Create a new order
const createOrder = async (userId, requestedItems) => {
    const items = await validateAndEnrichItems(requestedItems);
    const order = await Order.create({ userId, items });

    if (!order) {
        const error = new Error("Order could not be created");
        error.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        throw error;
    }

    return order;
};

// Get orders for a specific user
const getUserOrders = async (userId) => {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    if (!orders) {
        const error = new Error("Could not retrieve orders");
        error.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        throw error;
    }

    return orders;
};

// Get all orders (for admin)
const getAllOrders = async () => {
    const orders = await Order.find().sort({ createdAt: -1 });

    if (!orders) {
        const error = new Error("Could not retrieve orders");
        error.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        throw error;
    }

    return orders;
};

// Update order status
const updateOrderStatus = async (orderId, newStatus, requestingUser) => {
    const order = await Order.findById(orderId);

    if (!order) {
        const error = new Error("Order not found");
        error.statusCode = StatusCodes.NOT_FOUND;
        throw error;
    }

    if (!requestingUser.roles.includes(ROLES.ADMIN)) {
        const error = new Error("Forbidden: Only admins can update order status");
        error.statusCode = StatusCodes.FORBIDDEN;
        throw error;
    }

    order.transitionTo(newStatus);
    const updatedOrder = await order.save();

    if (!updatedOrder) {
        const error = new Error("Order status could not be updated");
        error.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        throw error;
    }

    return updatedOrder;
};


module.exports = {
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
};