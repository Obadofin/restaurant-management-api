const express = require("express");
const router = express.Router();
const controller = require("../controllers/table.controller");
const validate = require("../middlewares/validate");
const { protect, authorize } = require("../middlewares/auth.middleware");
const { createTableValidation, updateTableValidation } = require("../validations/tableValidator");
const { ROLES } = require("../core/constants");

router.get("/", controller.getTables);
router.get("/:id", controller.getTableById);

router.post("/", protect, authorize(ROLES.ADMIN), validate(createTableValidation), controller.createTable);

router.put("/:id", protect, authorize(ROLES.ADMIN, ROLES.STAFF), validate(updateTableValidation), controller.updateTable);

router.delete("/:id", protect, authorize(ROLES.ADMIN), controller.deleteTable);

module.exports = router;
