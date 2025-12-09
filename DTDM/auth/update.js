const express = require("express");
const router = express.Router();
const User = require("../models/userModel");

// UPDATE USER bằng POST
router.post("/update", async (req, res) => {
  try {
    const { id } = req.body; // lấy id từ body

    if (!id) {
      return res.status(400).json({ message: "Thiếu id user" });
    }
     let addPlan = 0;
    let { plan } = req.body;
    if (plan == "Basic") {
      addPlan = 5 * 1024 * 1024 * 1024; // 5GB
    } else if (plan == "Pro") {
      addPlan = 20 * 1024 * 1024 * 1024; // 20GB
    } else if (plan == "Business") {
      addPlan = 50 * 1024 * 1024 * 1024; // 50GB
    }
    const user = await User.findById(id);
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
        
          role: req.body.role,
         
          storageLimit: user.storageLimit   + addPlan,
          plan: req.body.plan,
        
        },
      },
      { new: true }
    );

    res.json(updatedUser);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi update user" });
  }
});

module.exports = router;
