import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "COMPANY_CREATED",
        "COMPANY_APPROVED",
        "COMPANY_REJECTED",
        "JOB_CREATED",
        "JOB_APPROVED",
        "JOB_REJECTED",
      ],
      required: true,
    },
    message: { type: String, default: "" },

    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin/recruiter gây ra sự kiện
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

export const Activity = mongoose.model("Activity", activitySchema);
