const orderService = require('../services/order.service');

// Create a new order
// POST /api/orders
const createOrder = async(req, res, next)=>{
    try{
        const order = await orderService.createOrder(req.user._id, req.body.items);
        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order,
        });

    }catch(err){
        console.log("error caught:", err.message);
        next(err);
    }
};

// GET /api/orders/me
const getMyOrders = async(req, res, next)=>{
    try{
        const orders = await orderService.getUserOrders(req.user._id);
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    }catch(err){
        next(err);
    }
};


// GET /api/admin/orders
const getAllOrders = async(req, res, next)=>{
    try{
        const orders = await orderService.getAllOrders();
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    }catch(err){
        next(err);
    }
};

// PATCH /api/orders/:id/status
const updateOrderStatus = async(req, res, next)=>{
    try {
        const order = await orderService.updateOrderStatus(req.params.id, req.body.status, req.user);
        res.status(200).json({
            success: true,
            message: `Order status updated to ${order.status}`,
            data: order,
        });
    }catch(err){
        
        next(err);
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
};