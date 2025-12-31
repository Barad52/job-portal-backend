const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: String,
    company: String,
    location: String,
    salary: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
