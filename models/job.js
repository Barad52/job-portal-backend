const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: String,
    company: String,
    location: String,
    salary: Number,

    requiredSkills: {
      type: [String],
      default: []
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open"
    },

    // 🔥 VERY IMPORTANT
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
