const express = require("express");
const router = express.Router();
const controller = require("../controllers/menu.controller");
const validate = require("../middlewares/validate");
const { protect, authorize } = require("../middlewares/auth.middleware");
const { createMenuValidation, updateMenuValidation } = require("../validations/menuValidator");
const { ROLES } = require("../core/constants");

// Public routes: anyone can browse the menu
router.get("/", controller.getMenuItems);           // List all food/drink items
router.get("/:id", controller.getMenuItemById);      // View details of one specific item

// Protected routes: must be logged in + have the right role to make changes
router.post("/", protect, authorize(ROLES.ADMIN, ROLES.STAFF), validate(createMenuValidation), controller.createMenuItem);   // Only admin or staff can add new menu items

router.put("/:id", protect, authorize(ROLES.ADMIN, ROLES.STAFF), validate(updateMenuValidation), controller.updateMenuItem); // Only admin or staff can edit menu items

router.delete("/:id", protect, authorize(ROLES.ADMIN), controller.deleteMenuItem);  // Only admin can remove menu items

module.exports = router;