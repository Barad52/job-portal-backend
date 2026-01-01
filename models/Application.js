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
      ref: "User",
      required: true
    },
    status: {
      type: String,
      default: "applied" // applied | shortlisted | rejected
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);