const Order = require('../models/order.model');
const MenuItem = require('../models/menu.model'); 
const { ROLES } = require("../core/constants");


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
        error.statusCode = 422;
        throw error;
    }

    return enriched;
};


// Create a new order
const createOrder = async (userId, requestedItems)=>{
    const items = await validateAndEnrichItems(requestedItems);
    const order = new Order({userId, items});
    await order.save();
    return order;
};


// Get orders for a specific user
const getUserOrders = async (userId)=>{
    return await Order.find({userId}).sort({createdAt: -1});
};


// Get all orders (for admin)
const getAllOrders = async ()=>{
    return Order.find().sort({createdAt: -1});
};

// update order status with validation
const updateOrderStatus = async (orderId, newStatus, requestingUser )=>{
    const order = await Order.findById(orderId);

    if(!order){
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
    }

    if(!requestingUser.roles.includes(ROLES.ADMIN)){
        const error = new Error("Forbidden: Only admins can update order status");
        error.statusCode = 403;
        throw error;
    }

    try {
        order.transitionTo(newStatus);
        await order.save();
        return order;
    } catch (err) {
        err.statusCode = 400;
        throw err;
    }
}

module.exports = {
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
};