const Category = require("../models/category.model");
const asyncHandler = require("../utils/asyncHandler");
const { StatusCodes } = require("http-status-codes");

// GET /api/categories
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.status(StatusCodes.OK).json({ success: true, data: categories });
});

// GET /api/categories/:id
exports.getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  res.status(StatusCodes.OK).json({ success: true, data: category });
});

// POST /api/categories
exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const category = await Category.create({ name, description });

  res.status(StatusCodes.CREATED).json({ success: true, data: category });
});

// PUT /api/categories/:id
exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  res.status(StatusCodes.OK).json({ success: true, data: category });
});

// DELETE /api/categories/:id
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  res.status(StatusCodes.OK).json({ success: true, message: "Category deleted" });
});
