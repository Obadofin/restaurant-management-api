// Import MenuItem model for interacting with menu items collection
const MenuItem = require("../models/menu.model");

// Import Category model to validate category existence
const Category = require("../models/category.model");

// Wrapper to automatically catch async errors
const asyncHandler = require("../utils/asyncHandler");

// Standard HTTP status codes (200, 201, 404, etc.)
const { StatusCodes } = require("http-status-codes");


// ======================= GET ALL MENU ITEMS =======================
// GET /api/menu
exports.getMenuItems = asyncHandler(async (req, res) => {

  // Object used to store search filters
  const filter = {};

  // If category is passed in query, filter menu items by category
  if (req.query.category) {
    filter.category = req.query.category;
  }

  // Fetch menu items, include category details, and sort alphabetically
  const items = await MenuItem.find(filter)
    .populate("category", "name description")
    .sort({ name: 1 });

  // Send menu items back to the client
  res.status(StatusCodes.OK).json({
    success: true,
    data: items,
  });
});


// ======================= GET MENU ITEM BY ID =======================
// GET /api/menu/:id
exports.getMenuItemById = asyncHandler(async (req, res) => {

  // Find menu item by ID and include category details
  const item = await MenuItem.findById(req.params.id)
    .populate("category", "name description");

  // If menu item does not exist, throw error
  if (!item) {
    const error = new Error("Menu item not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  // Send found menu item back to the client
  res.status(StatusCodes.OK).json({
    success: true,
    data: item,
  });
});


// ======================= CREATE MENU ITEM =======================
// POST /api/menu
exports.createMenuItem = asyncHandler(async (req, res) => {

  // Extract menu item details from request body
  const {
    name,
    description,
    price,
    category,
    isAvailable,
    image,
  } = req.body;

  // Check if the provided category exists
  const categoryExists = await Category.findById(category);

  if (!categoryExists) {
    const error = new Error("Category not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  // Create new menu item
  const item = await MenuItem.create({
    name,
    description,
    price,
    category,
    isAvailable,
    image,
  });

  // Add category details to the created item
  await item.populate("category", "name description");

  // Send created menu item back to the client
  res.status(StatusCodes.CREATED).json({
    success: true,
    data: item,
  });
});


// ======================= UPDATE MENU ITEM =======================
// PUT /api/menu/:id
exports.updateMenuItem = asyncHandler(async (req, res) => {

  // If category is being updated, verify it exists first
  if (req.body.category) {
    const categoryExists = await Category.findById(req.body.category);

    if (!categoryExists) {
      const error = new Error("Category not found");
      error.statusCode = StatusCodes.NOT_FOUND;
      throw error;
    }
  }

  // Find menu item by ID and update it
  const item = await MenuItem.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      // Return updated document
      new: true,

      // Run schema validations during update
      runValidators: true,
    }
  ).populate("category", "name description");

  // If menu item does not exist, throw error
  if (!item) {
    const error = new Error("Menu item not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  // Send updated item back to the client
  res.status(StatusCodes.OK).json({
    success: true,
    data: item,
  });
});


// ======================= DELETE MENU ITEM =======================
// DELETE /api/menu/:id
exports.deleteMenuItem = asyncHandler(async (req, res) => {

  // Find menu item by ID and delete it
  const item = await MenuItem.findByIdAndDelete(req.params.id);

  // If menu item does not exist, throw error
  if (!item) {
    const error = new Error("Menu item not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  // Send success message after deletion
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Menu item deleted",
  });
});