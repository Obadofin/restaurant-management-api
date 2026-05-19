const Order = require('../models/order.model');
const MenuItem = require('../models/menu.model'); 
const { ROLES } = require("../core/constants");
const { StatusCodes } = require('http-status-codes');


// Checks the items in a customer's cart, fetches current prices, and flags any problems
const validateAndEnrichItems = async (requestedItems) => {
    // Collect all menu item IDs the customer is ordering
    const ids = requestedItems.map((item)=> item.menuItemId);
    // Look up those items in the database in one batch (efficient)
    const menuItems = await MenuItem.find({_id: {$in: ids}});

    // Build a lookup map so we can quickly find an item by its ID
    const menuItemMap = new Map(
        menuItems.map((m)=> [m._id.toString(), m])
    );

    const errors = [];
    // For each requested item, verify it exists and is available, then attach current details
    const enriched = requestedItems.map((item)=>{
        const found = menuItemMap.get(item.menuItemId.toString());

        // If the item doesn't exist in the menu anymore, note the error
        if(!found){
            errors.push(`Menu item  ${item.menuItemId} does not exist`);
            return null;
        }
        // If the item is temporarily disabled (e.g., out of stock), note the error
        if(!found.isAvailable){
            errors.push(`Menu item "${found.name}" is currently unavailable `);
            return null;
        }

        // Build the clean order line with up-to-date name and price
        return {
            menuItemId: found._id,
            name: found.name,
            quantity: item.quantity,
            unitPrice: found.price,
            subTotal: 0, // Will be auto-calculated by the order model before saving
        };
    });

    // If any item was invalid, stop here and tell the customer what went wrong
    if(errors.length > 0){
        const error = new Error(errors.join("; "));
        error.statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
        throw error;
    }

    return enriched;
};


// Places a new order after validating the cart contents
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

// Fetches a customer's personal order history (newest first)
const getUserOrders = async (userId) => {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    if (!orders) {
        const error = new Error("Could not retrieve orders");
        error.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        throw error;
    }

    return orders;
};

// Fetches every order in the system for admin oversight (newest first)
const getAllOrders = async () => {
    const orders = await Order.find().sort({ createdAt: -1 });

    if (!orders) {
        const error = new Error("Could not retrieve orders");
        error.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        throw error;
    }

    return orders;
};

// Updates an order's progress (e.g., pending → preparing) — admin only
const updateOrderStatus = async (orderId, newStatus, requestingUser) => {
    const order = await Order.findById(orderId);

    // Can't update what doesn't exist
    if (!order) {
        const error = new Error("Order not found");
        error.statusCode = StatusCodes.NOT_FOUND;
        throw error;
    }

    // Only admins are allowed to change order status
    if (!requestingUser.roles.includes(ROLES.ADMIN)) {
        const error = new Error("Forbidden: Only admins can update order status");
        error.statusCode = StatusCodes.FORBIDDEN;
        throw error;
    }

    // Uses the model's built-in rules to ensure the status change is legal
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