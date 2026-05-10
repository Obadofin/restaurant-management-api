const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const orderController = require('../controllers/orderController');
const validate = require('../middleware/validate');

// Temporary auth middleware for testing
const protect = (req, res, next)=>{
    req.user= {_id: "64f1b2c3d4e5f6a7b8c9d0e1", role: "admin"};
    next();
};

// POST /api/orders/create-order (admin only)
router.post("/create-order", protect, validate([
    body("items").isArray({min: 1}).withMessage("items must be a non-empty array"),
    body("items.*.menuItemId").notEmpty().withMessage("each item must have a menuItemId"),
    body("items.*.quantity").isInt({min: 1}).withMessage("quantity must be a whole number of at least 1"),
]),
orderController.createOrder);

// GET /api/orders/me
router.get("/me", protect, orderController.getMyOrders);

// PATCH /api/orders/:id/status (admin only)
router.patch("/:id/status", protect, validate([
    param("id").isMongoId().withMessage("Invalid order ID"),
    body("status").notEmpty().withMessage("status is required").isIn(["pending", "preparing", "completed", "cancelled"]).withMessage("Invalid status value"),
]),
orderController.updateOrderStatus);

// GET /api/orders/getAllorders (admin only)
router.get("/getAllorders", protect, orderController.getAllOrders);

module.exports = router;