require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// models
const Job = require("./models/job");

// routes
const authRoutes = require("./routes/auth");
const auth = require("./middleware/auth");
const roleCheck = require("./middleware/role");

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

// auth routes
app.use("/auth", authRoutes);

// =========================
// JOB ROUTES
// =========================

// GET all jobs (public)
app.get("/jobs", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching jobs" });
  }
});

// ADD job (ADMIN only)
app.post("/jobs", auth, roleCheck("admin"), async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: "Error adding job" });
  }
});

// UPDATE job (ADMIN only)
app.put("/jobs/:id", auth, roleCheck("admin"), async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: "Error updating job" });
  }
});

// DELETE job (ADMIN only)
app.delete("/jobs/:id", auth, roleCheck("admin"), async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted" });
  } catch (err) {
    res.status(400).json({ message: "Error deleting job" });
  }
});

// mongo connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
