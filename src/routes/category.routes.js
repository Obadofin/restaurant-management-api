const express = require("express");
const router = express.Router();
const controller = require("../controllers/category.controller");
const validate = require("../middlewares/validate");
const { protect, authorize } = require("../middlewares/auth.middleware");
const { createCategoryValidation, updateCategoryValidation } = require("../validations/categoryValidator");
const { ROLES } = require("../core/constants");

// Public routes: anyone can view categories
router.get("/", controller.getCategories);           // List all categories
router.get("/:id", controller.getCategoryById);      // View one specific category

// Protected routes: must be logged in + have the right role
router.post("/", protect, authorize(ROLES.ADMIN, ROLES.STAFF), validate(createCategoryValidation), controller.createCategory);   // Only admin or staff can add new categories

router.put("/:id", protect, authorize(ROLES.ADMIN, ROLES.STAFF), validate(updateCategoryValidation), controller.updateCategory); // Only admin or staff can edit categories

router.delete("/:id", protect, authorize(ROLES.ADMIN), controller.deleteCategory);  // Only admin can delete categories

module.exports = router;