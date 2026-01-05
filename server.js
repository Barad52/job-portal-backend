require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Routes
const authRoutes = require("./routes/auth");
const applicationRoutes = require("./routes/application");
const userRoutes = require("./routes/user");
const dashboardRoutes = require("./routes/dashboard");

// Models
const Job = require("./models/job");

// Middleware
const auth = require("./middleware/auth");
const roleCheck = require("./middleware/role");

const app = express();
const PORT = process.env.PORT || 5000;

/* =================================================
   🔥 CORS (FINAL FIX — NETLIFY + LOCAL + PREFLIGHT)
================================================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://jobportal9587.netlify.app"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // 🔥 Preflight request
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* =================================================
   SECURITY
================================================= */
app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  })
);

app.use(express.json());

/* =================================================
   ROUTES
================================================= */
app.use("/auth", authRoutes);
app.use("/applications", applicationRoutes);
app.use("/users", userRoutes);
app.use("/dashboard", dashboardRoutes);

/* =================================================
   JOB ROUTES
================================================= */

// GET JOBS (PUBLIC + FILTER + PAGINATION)
app.get("/jobs", async (req, res) => {
  try {
    const { location, skill, page = 1 } = req.query;

    const limit = 6;
    const skip = (page - 1) * limit;

    let query = { status: "open" };

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (skill) {
      query.requiredSkills = { $in: [new RegExp(skill, "i")] };
    }

    const totalJobs = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      jobs,
      totalPages: Math.ceil(totalJobs / limit),
      currentPage: Number(page)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// ADD JOB (ADMIN)
app.post("/jobs", auth, roleCheck("admin"), async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Error adding job" });
  }
});

// UPDATE JOB
app.put("/jobs/:id", auth, roleCheck("admin"), async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Error updating job" });
  }
});

// UPDATE JOB STATUS
app.patch("/jobs/:id/status", auth, roleCheck("admin"), async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Status update failed" });
  }
});

// DELETE JOB
app.delete("/jobs/:id", auth, roleCheck("admin"), async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Error deleting job" });
  }
});

/* =================================================
   DATABASE + SERVER
================================================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch(err => console.error("MongoDB error:", err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
