const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/user");

const router = express.Router();

// GET my profile (WORKER)
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// UPDATE my profile (WORKER)
router.put("/me", auth, async (req, res) => {
  try {
    const { skills, experience } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { skills, experience },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Profile update failed" });
  }
});

module.exports = router;