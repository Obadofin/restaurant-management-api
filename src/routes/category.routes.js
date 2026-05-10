const express = require("express");
const router = express.Router();
const controller = require("../controllers/category.controller");
const validate = require("../middlewares/validate");
const { protect, authorize } = require("../middlewares/auth.middleware");
const { createCategoryValidation, updateCategoryValidation } = require("../validations/categoryValidator");
const { ROLES } = require("../core/constants");

router.get("/", controller.getCategories);
router.get("/:id", controller.getCategoryById);

router.post("/", protect, authorize(ROLES.ADMIN, ROLES.STAFF), validate(createCategoryValidation), controller.createCategory);

router.put("/:id", protect, authorize(ROLES.ADMIN, ROLES.STAFF), validate(updateCategoryValidation), controller.updateCategory);

router.delete("/:id", protect, authorize(ROLES.ADMIN), controller.deleteCategory);

module.exports = router;
