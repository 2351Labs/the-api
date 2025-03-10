const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

const authenticateJWT = require("../middleware/autheticateJWT.js");
const authorizeRoles = require("../middleware/authorizeRoles.js");

router.get("/getUser", authenticateJWT, userController.getUser);
router.post("/signup", userController.createUser);
router.post("/login", userController.validateUser);
router.post("/oauth/google", userController.googleOAuth);
router.post("/oauth/microsoft", userController.microsoftOAuth);
router.get(
  "/protected",
  authenticateJWT,
  authorizeRoles(["user"]),
  userController.protected
);

module.exports = router;
