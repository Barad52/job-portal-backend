const express = require("express");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/role");
const Job = require("../models/job");
const Application = require("../models/Application");

const router = express.Router();

router.get("/stats", auth, roleCheck("admin"), async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user.id }).select("_id");
    const jobIds = jobs.map(j => j._id);

    const totalJobs = jobs.length;

    const openJobs = await Job.countDocuments({
      createdBy: req.user.id,
      status: "open"
    });

    const closedJobs = await Job.countDocuments({
      createdBy: req.user.id,
      status: "closed"
    });

    const totalApplications = await Application.countDocuments({
      job: { $in: jobIds }
    });

    const shortlisted = await Application.countDocuments({
      job: { $in: jobIds },
      status: "shortlisted"
    });

    const rejected = await Application.countDocuments({
      job: { $in: jobIds },
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
    console.error(err);
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
});


router.get("/applications", auth, roleCheck("admin"), async (req, res) => {
  try {
    const { status } = req.query;

    const jobs = await Job.find({ createdBy: req.user.id }).select("_id");
    const jobIds = jobs.map(j => j._id);

    let query = { job: { $in: jobIds } };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate("job", "title location status")
      .populate("worker", "name email skills experience");

    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load applications" });
  }
});

module.exports = router;
