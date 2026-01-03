const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "worker",
      required: true
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "worker"
    },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected"],
      default: "applied"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
