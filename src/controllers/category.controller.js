// Import the Category model for interacting with the categories collection
const Category = require("../models/category.model");

// Wrapper for handling async errors automatically
const asyncHandler = require("../utils/asyncHandler");

// Standard HTTP status codes (200, 201, 404, etc.)
const { StatusCodes } = require("http-status-codes");


// ======================= GET ALL CATEGORIES =======================
// GET /api/categories
exports.getCategories = asyncHandler(async (req, res) => {

  // Fetch all categories and sort them alphabetically by name
  const categories = await Category.find().sort({ name: 1 });

  // Send the categories back to the client
  res.status(StatusCodes.OK).json({
    success: true,
    data: categories,
  });
});


// ======================= GET CATEGORY BY ID =======================
// GET /api/categories/:id
exports.getCategoryById = asyncHandler(async (req, res) => {

  // Find category using the ID from the URL
  const category = await Category.findById(req.params.id);

  // If category does not exist, throw an error
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  // Send the found category back to the client
  res.status(StatusCodes.OK).json({
    success: true,
    data: category,
  });
});


// ======================= CREATE CATEGORY =======================
// POST /api/categories
exports.createCategory = asyncHandler(async (req, res) => {

  // Extract category details from request body
  const { name, description } = req.body;

  // Create a new category in the database
  const category = await Category.create({
    name,
    description,
  });

  // Send success response with created category
  res.status(StatusCodes.CREATED).json({
    success: true,
    data: category,
  });
});


// ======================= UPDATE CATEGORY =======================
// PUT /api/categories/:id
exports.updateCategory = asyncHandler(async (req, res) => {

  // Find category by ID and update it
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,

    // Return updated document and run schema validations
    { new: true, runValidators: true }
  );

  // If category is not found, throw error
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  // Send updated category back to the client
  res.status(StatusCodes.OK).json({
    success: true,
    data: category,
  });
});


// ======================= DELETE CATEGORY =======================
// DELETE /api/categories/:id
exports.deleteCategory = asyncHandler(async (req, res) => {

  // Find category by ID and delete it
  const category = await Category.findByIdAndDelete(req.params.id);

  // If category does not exist, throw error
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  // Send success message after deletion
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Category deleted",
  });
});