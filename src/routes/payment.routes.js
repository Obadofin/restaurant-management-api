const express = require("express");
const router = express.Router();
const controller = require("../controllers/payment.controller");
const validate = require("../middlewares/validate");
const { protect, authorize } = require("../middlewares/auth.middleware");
const { processPaymentValidation } = require("../validations/paymentValidator");
const { ROLES } = require("../core/constants");

// POST /api/payments/process
router.post("/process", protect, validate(processPaymentValidation), controller.processPayment);

// GET /api/payments/me
router.get("/me", protect, controller.getMyPayments);

// GET /api/payments (admin only)
router.get("/", protect, authorize(ROLES.ADMIN), controller.getAllPayments);

module.exports = router;
