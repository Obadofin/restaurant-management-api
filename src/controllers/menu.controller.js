const MenuItem = require("../models/menu.model");
const Category = require("../models/category.model");
const asyncHandler = require("../utils/asyncHandler");
const { StatusCodes } = require("http-status-codes");

// GET /api/menu
exports.getMenuItems = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.category) {
    filter.category = req.query.category;
  }

  const items = await MenuItem.find(filter).populate("category", "name description").sort({ name: 1 });

  res.status(StatusCodes.OK).json({ success: true, data: items });
});

// GET /api/menu/:id
exports.getMenuItemById = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id).populate("category", "name description");

  if (!item) {
    const error = new Error("Menu item not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  res.status(StatusCodes.OK).json({ success: true, data: item });
});

// POST /api/menu
exports.createMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, category, isAvailable, image } = req.body;

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    const error = new Error("Category not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  const item = await MenuItem.create({
    name,
    description,
    price,
    category,
    isAvailable,
    image,
  });

  await item.populate("category", "name description");

  res.status(StatusCodes.CREATED).json({ success: true, data: item });
});

// PUT /api/menu/:id
exports.updateMenuItem = asyncHandler(async (req, res) => {
  if (req.body.category) {
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      const error = new Error("Category not found");
      error.statusCode = StatusCodes.NOT_FOUND;
      throw error;
    }
  }

  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("category", "name description");

  if (!item) {
    const error = new Error("Menu item not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  res.status(StatusCodes.OK).json({ success: true, data: item });
});

// DELETE /api/menu/:id
exports.deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id);

  if (!item) {
    const error = new Error("Menu item not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  res.status(StatusCodes.OK).json({ success: true, message: "Menu item deleted" });
});
