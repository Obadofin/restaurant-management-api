const express = require("express");
const router = express.Router();
const controller = require("../controllers/reservation.controller");
const validate = require("../middlewares/validate");
const { protect, authorize } = require("../middlewares/auth.middleware");
const {
  createReservationValidation,
  updateReservationStatusValidation,
} = require("../validations/reservationValidator");
const { ROLES } = require("../core/constants");

router.get("/", protect, controller.getReservations);
router.get("/:id", protect, controller.getReservationById);

router.post("/", protect, validate(createReservationValidation), controller.createReservation);

router.put(
  "/:id/status",
  protect,
  authorize(ROLES.ADMIN, ROLES.STAFF),
  validate(updateReservationStatusValidation),
  controller.updateReservationStatus,
);

router.delete("/:id", protect, authorize(ROLES.ADMIN), controller.deleteReservation);

module.exports = router;
