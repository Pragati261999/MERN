const express = require("express");
const router = express.Router();
const { register, login, getProfile, updateUser } = require("../controllers/user.controller");
const { auth, authorize } = require("../middleware/auth");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/profile", auth, getProfile);
router.patch("/:id", auth, authorize("admin"), updateUser);

module.exports = router;
