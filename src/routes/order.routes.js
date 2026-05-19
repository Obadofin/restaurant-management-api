const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const validateOrder = require('../middlewares/orderValidate');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { createOrderValidation, updateOrderStatusValidation } = require('../validations/orderValidator');
const { ROLES } = require("../core/constants");

// POST /api/orders — Customer places a new order (must be logged in, data is validated)
router.post("/", protect, validateOrder(createOrderValidation), orderController.createOrder);

// GET /api/orders/me — Customer views their own order history (must be logged in)
router.get("/me", protect, orderController.getMyOrders);

// PATCH /api/orders/:id/status — Staff updates order progress (e.g., pending → preparing) (admin/staff only, status change is validated)
router.patch("/:id/status", protect, authorize(ROLES.ADMIN, ROLES.STAFF), validateOrder(updateOrderStatusValidation), orderController.updateOrderStatus);

// GET /api/orders/admin — Staff views all orders in the system (admin/staff only)
router.get("/admin", protect, authorize(ROLES.ADMIN, ROLES.STAFF), orderController.getAllOrders);

module.exports = router;