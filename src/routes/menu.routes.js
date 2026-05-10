const express = require("express");
const router = express.Router();
const controller = require("../controllers/menu.controller");
const validate = require("../middlewares/validate");
const { protect, authorize } = require("../middlewares/auth.middleware");
const { createMenuValidation, updateMenuValidation } = require("../validations/menuValidator");
const { ROLES } = require("../core/constants");

router.get("/", controller.getMenuItems);
router.get("/:id", controller.getMenuItemById);

router.post("/", protect, authorize(ROLES.ADMIN, ROLES.STAFF), validate(createMenuValidation), controller.createMenuItem);

router.put("/:id", protect, authorize(ROLES.ADMIN, ROLES.STAFF), validate(updateMenuValidation), controller.updateMenuItem);

router.delete("/:id", protect, authorize(ROLES.ADMIN), controller.deleteMenuItem);

module.exports = router;
