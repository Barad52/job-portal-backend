const express = require("express");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/role");
const Job = require("../models/job");
const Application = require("../models/Application");

const router = express.Router();

// EMPLOYER DASHBOARD STATS
router.get(
  "/stats",
  auth,
  roleCheck("admin"),
  async (req, res) => {
    try {
      const totalJobs = await Job.countDocuments();
      const openJobs = await Job.countDocuments({ status: "open" });
      const closedJobs = await Job.countDocuments({ status: "closed" });

      const totalApplications = await Application.countDocuments();
      const shortlisted = await Application.countDocuments({
        status: "shortlisted"
      });
      const rejected = await Application.countDocuments({
        status: "rejected"
      });

      res.json({
        totalJobs,
        openJobs,
        closedJobs,
        totalApplications,
        shortlisted,
        rejected
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to load dashboard stats" });
    }
  }
);

module.exports = router;