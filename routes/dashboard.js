const express = require("express");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/role");
const Job = require("../models/job");
const Application = require("../models/Application");

const router = express.Router();

/* ===========================
   DASHBOARD STATS
=========================== */
router.get(
  "/stats",
  auth,
  roleCheck("admin"),
  async (req, res) => {
    try {
      const totalJobs = await Job.countDocuments({ createdBy: req.user.id });
      const openJobs = await Job.countDocuments({
        createdBy: req.user.id,
        status: "open"
      });
      const closedJobs = await Job.countDocuments({
        createdBy: req.user.id,
        status: "closed"
      });

      const totalApplications = await Application.countDocuments({
        employer: req.user.id
      });
      const shortlisted = await Application.countDocuments({
        employer: req.user.id,
        status: "shortlisted"
      });
      const rejected = await Application.countDocuments({
        employer: req.user.id,
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

/* ===========================
   DASHBOARD APPLICATIONS LIST
=========================== */
router.get(
  "/applications",
  auth,
  roleCheck("admin"),
  async (req, res) => {
    try {
      const applications = await Application.find({
        employer: req.user.id
      })
        .populate("job", "title location")
        .populate("worker", "name email skills experience");

      res.json(applications);
    } catch (err) {
      res.status(500).json({ message: "Failed to load applications" });
    }
  }
);

module.exports = router;