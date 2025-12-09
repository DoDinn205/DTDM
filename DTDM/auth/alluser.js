const express = require("express");
const router = express.Router();
const User = require("../models/userModel");

const { requireAuth } = require("../middleware/auth");
// GET tất cả user
router.get("/all",requireAuth ,async (req, res) => {
  try {
    const users = await User.find();   // ← LẤY TẤT CẢ USER
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
