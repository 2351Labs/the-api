const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController");
const authenticateJWT = require("../middleware/autheticateJWT.js");
const authorizeRoles = require("../middleware/authorizeRoles.js");

router.get("/pagination", itemController.getIdsForPage);///params: items?page=2&pageSize=5



module.exports = router;
