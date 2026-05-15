const Table = require("../models/table.model");
const Reservation = require("../models/reservation.model");
const asyncHandler = require("../utils/asyncHandler");
const { StatusCodes } = require("http-status-codes");
const { RESERVATION_STATUS } = require("../core/constants");

// GET /api/tables
exports.getTables = asyncHandler(async (req, res) => {
  const tables = await Table.find().sort({ tableNumber: 1 });
  res.status(StatusCodes.OK).json({ success: true, data: tables });
});

// GET /api/tables/:id
exports.getTableById = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);

  if (!table) {
    const error = new Error("Table not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  res.status(StatusCodes.OK).json({ success: true, data: table });
});

// POST /api/tables
exports.createTable = asyncHandler(async (req, res) => {
  const table = await Table.create(req.body);
  res.status(StatusCodes.CREATED).json({ success: true, data: table });
});

// PUT /api/tables/:id
exports.updateTable = asyncHandler(async (req, res) => {
  const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!table) {
    const error = new Error("Table not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  res.status(StatusCodes.OK).json({ success: true, data: table });
});

// DELETE /api/tables/:id
exports.deleteTable = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);

  if (!table) {
    const error = new Error("Table not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  const activeReservations = await Reservation.exists({
    table: table._id,
    status: { $in: [RESERVATION_STATUS.PENDING, RESERVATION_STATUS.CONFIRMED] },
  });

  if (activeReservations) {
    const error = new Error("Cannot delete a table with active reservations");
    error.statusCode = StatusCodes.CONFLICT;
    throw error;
  }

  await table.deleteOne();
  res.status(StatusCodes.OK).json({ success: true, data: {} });
});
