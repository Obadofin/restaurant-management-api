const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const validateOrder = require('../middlewares/orderValidate');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { createOrderValidation, updateOrderStatusValidation } = require('../validations/orderValidator');
const { ROLES } = require("../core/constants");

// POST /api/orders
router.post("/", protect, validateOrder(createOrderValidation),
orderController.createOrder);

// GET /api/orders/me
router.get("/me", protect, orderController.getMyOrders);

// PATCH /api/orders/:id/status (admin only)
router.patch("/:id/status", protect, authorize(ROLES.ADMIN), validateOrder(updateOrderStatusValidation),
orderController.updateOrderStatus);

// GET /api/orders/admin (admin only)
router.get("/admin", protect, authorize(ROLES.ADMIN), orderController.getAllOrders);

module.exports = router;