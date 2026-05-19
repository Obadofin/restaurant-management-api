const Reservation = require("../models/reservation.model");
const Table = require("../models/table.model");
const asyncHandler = require("../utils/asyncHandler");
const { StatusCodes } = require("http-status-codes");
const { ROLES, RESERVATION_STATUS, TABLE_STATUS } = require("../core/constants");

const ACTIVE_STATUSES = [RESERVATION_STATUS.PENDING, RESERVATION_STATUS.CONFIRMED];

// GET /api/reservations
exports.getReservations = asyncHandler(async (req, res) => {
  const isPrivileged = req.user.roles.some(
    (r) => r === ROLES.ADMIN || r === ROLES.STAFF,
  );

  const filter = isPrivileged ? {} : { customer: req.user._id };

  const reservations = await Reservation.find(filter)
    .populate("table", "tableNumber capacity location")
    .populate("customer", "name email")
    .sort({ date: 1, time: 1 });

  res.status(StatusCodes.OK).json({ success: true, data: reservations });
});

// GET /api/reservations/:id
exports.getReservationById = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id)
    .populate("table", "tableNumber capacity location")
    .populate("customer", "name email");

  if (!reservation) {
    const error = new Error("Reservation not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  const isPrivileged = req.user.roles.some(
    (r) => r === ROLES.ADMIN || r === ROLES.STAFF,
  );

  if (!isPrivileged && reservation.customer._id.toString() !== req.user._id.toString()) {
    const error = new Error("You are not authorized to view this reservation");
    error.statusCode = StatusCodes.FORBIDDEN;
    throw error;
  }

  res.status(StatusCodes.OK).json({ success: true, data: reservation });
});

// POST /api/reservations
exports.createReservation = asyncHandler(async (req, res) => {
  const { table, date, time, partySize, specialRequests } = req.body;

  const tableDoc = await Table.findById(table);
  if (!tableDoc) {
    const error = new Error("Table not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  // Normalize the incoming date to a UTC day boundary for comparison
  const reservationDate = new Date(date);
  const dayStart = new Date(reservationDate);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(reservationDate);
  dayEnd.setUTCHours(23, 59, 59, 999);

  const conflict = await Reservation.exists({
    table,
    date: { $gte: dayStart, $lte: dayEnd },
    time,
    status: { $in: ACTIVE_STATUSES },
  });

  if (conflict) {
    const error = new Error(
      "This table is already reserved for the selected date and time",
    );
    error.statusCode = StatusCodes.CONFLICT;
    throw error;
  }

  const reservation = await Reservation.create({
    customer: req.user._id,
    table,
    date: reservationDate,
    time,
    partySize,
    specialRequests,
  });

  await reservation.populate("table", "tableNumber capacity location");
  await reservation.populate("customer", "name email");

  res.status(StatusCodes.CREATED).json({ success: true, data: reservation });
});

// PUT /api/reservations/:id/status
exports.updateReservationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    const error = new Error("Reservation not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  reservation.status = status;
  await reservation.save();

  // Sync table status
  if (status === RESERVATION_STATUS.CONFIRMED) {
    await Table.findByIdAndUpdate(reservation.table, {
      status: TABLE_STATUS.RESERVED,
    });
  } else if (status === RESERVATION_STATUS.CANCELLED) {
    const otherActive = await Reservation.exists({
      _id: { $ne: reservation._id },
      table: reservation.table,
      status: { $in: ACTIVE_STATUSES },
    });

    if (!otherActive) {
      await Table.findByIdAndUpdate(reservation.table, {
        status: TABLE_STATUS.AVAILABLE,
      });
    }
  }

  await reservation.populate("table", "tableNumber capacity location");
  await reservation.populate("customer", "name email");

  res.status(StatusCodes.OK).json({ success: true, data: reservation });
});

// DELETE /api/reservations/:id
exports.deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    const error = new Error("Reservation not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  await reservation.deleteOne();
  res.status(StatusCodes.OK).json({ success: true, data: {} });
});
