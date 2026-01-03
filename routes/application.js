const express = require("express");
const Application = require("../models/Application");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/role");
const Job = require("../models/job");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

/* ===========================
   APPLY JOB (WORKER)
=========================== */
router.post("/apply", auth, roleCheck("worker"), async (req, res) => {
  try {
    const { jobId } = req.body;


    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }


    if (job.status === "closed") {
      return res.status(400).json({ message: "Job is closed" });
    }

 
    const worker = await User.findById(req.user.id);
    if (!worker.skills.length || !worker.experience) {
      return res.status(400).json({
        message: "Please complete your profile before applying"
      });
    }

    const alreadyApplied = await Application.findOne({
      job: jobId,
      worker: req.user.id
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied" });
    }


    const application = await Application.create({
      job: jobId,
      worker: req.user.id,
      employer: job.createdBy,  
      status: "applied"
    });

   
    await sendEmail(
      worker.email,
      "Job Application Submitted",
      `You have successfully applied for ${job.title} at ${job.company}.`
    );

    res.json({
      message: "Applied successfully",
      application
    });
  } catch (err) {
    console.error("APPLY ERROR:", err);
    res.status(500).json({ message: "Apply failed" });
  }
});

/* ===========================
   WORKER → MY APPLICATIONS
=========================== */
router.get("/my", auth, roleCheck("worker"), async (req, res) => {
  try {
    const applications = await Application.find({
      worker: req.user.id
    }).populate(
      "job",
      "title company location salary status requiredSkills"
    );

    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch applied jobs" });
  }
});

/* ===========================
   ADMIN → VIEW APPLICANTS BY JOB
=========================== */
router.get("/job/:jobId", auth, roleCheck("admin"), async (req, res) => {
  try {
    const applications = await Application.find({
      job: req.params.jobId
    })
      .populate("worker", "name email skills experience")
      .populate("job", "title company");

    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch applicants" });
  }
});

/* ===========================
   ADMIN → UPDATE APPLICATION STATUS
=========================== */
router.patch("/:id/status", auth, roleCheck("admin"), async (req, res) => {
  try {
    const { status } = req.body;

    if (!["shortlisted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("worker", "email name")
      .populate("job", "title");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }


    await sendEmail(
      application.worker.email,
      "Application Status Update",
      `Your application for ${application.job.title} has been ${status}.`
    );

    res.json(application);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Status update failed" });
  }
});

module.exports = router;
