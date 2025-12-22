import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Activity } from "../models/activity.model.js";

// [POST] /api/v1/job/post
export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      companyID,
    } = req.body.data;

    const userID = req.id;

    if (
      !title ||
      !description ||
      !salary ||
      !requirements ||
      !location ||
      !jobType ||
      !experience ||
      !position ||
      !companyID
    ) {
      return res.status(400).json({
        message: "Something is missing!",
        success: false,
      });
    }

    const user = await User.findOne({ _id: userID });
    if (!user) {
      return res.status(400).json({
        message: "User not found!",
        success: false,
      });
    }

    if (user.role === "student") {
      return res.status(400).json({
        message: "You don't have permission",
        success: false,
      });
    }

    const company = await Company.findById(companyID);
    if (!company) {
      return res.status(404).json({
        message: "Company not found!",
        success: false,
      });
    }

    if (String(company.userId) !== String(userID)) {
      return res.status(403).json({
        message: "You are not owner of this company",
        success: false,
      });
    }

    if (company.status !== "APPROVED") {
      return res.status(403).json({
        message: "Company has not been approved by admin",
        success: false,
      });
    }

    // Job luôn PENDING (dùng default)
    const job = await Job.create({
      title,
      description,
      requirements: requirements.split(","),
      salary: Number(salary),
      location,
      jobType,
      experienceLevel: experience,
      position,
      company: companyID,
      created_by: userID,
    });

    await Activity.create({
      type: "JOB_CREATED",
      actor: userID,
      company: companyID,
      job: job._id,
      message: `Job "${job.title}" created (PENDING)`,
    });

    return res.status(201).json({
      message: "New Job created successfully! (waiting for admin approval)",
      success: true,
      job,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// [GET] /api/v1/job/get?Key=...&Value=...
export const getAllJobs = async (req, res) => {
  try {
    const key = req.query.Key || "title";
    const value = req.query.Value || "";

    const query = {
        status: { $ne: "REJECTED" },
        [key]: { $regex: value, $options: "i" },
    };

    const jobs = await Job.find(query)
      .populate({ path: "company" })
      .populate({
        path: "applications",
        populate: [{ path: "applicant", select: "fullName" }],
      })
      .sort({ createdAt: -1 });

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        message: "Job not found!",
        success: false,
      });
    }

    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// [GET] /api/v1/job/get/:id
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await Job.findById(jobId).populate([
      { path: "applications", select: "applicant" },
      { path: "company", select: "name logo description location website" },
    ]);

    if (!job) {
      return res.status(404).json({
        message: "Jobs not found!",
        success: false,
      });
    }

    return res.status(200).json({
      job,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// [GET] /api/v1/job/getAdmin/:id
export const getJobByIdAdmin = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.id;

    const job = await Job.findOne({
      _id: jobId,
      created_by: userId,
    }).populate([
      { path: "applications", select: "applicant" },
      { path: "company", select: "name" },
    ]);

    if (!job) {
      return res.status(404).json({
        message: "Jobs not found!",
        success: false,
      });
    }

    return res.status(200).json({
      job,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// [GET] /api/v1/job/getAdminJob
export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id;

    const jobs = await Job.find({ created_by: adminId }).populate({
      path: "company",
      select: "name logo status",
    });

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        message: "Job not found!",
        success: false,
      });
    }

    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// [PATCH] /api/v1/job/updateJob/:id
export const EditJob = async (req, res) => {
  try {
    const {
      companyID, // input từ client (nếu có)
      description,
      experienceLevel,
      jobType,
      location,
      position,
      requirements,
      salary,
      title,
    } = req.body;

    const jobId = req.params.id;
    const job = await Job.findOne({ _id: jobId });

    if (!job) {
      return res.status(404).json({
        message: "Job not found!",
        success: false,
      });
    }

    // NOTE: schema đang dùng field `company` (vì create job dùng company: companyID)
    const updateData = {
      company: companyID ? companyID : job?.company,
      description: description ? description : job?.description,
      experienceLevel: experienceLevel ? experienceLevel : job?.experienceLevel,
      jobType: jobType ? jobType : job?.jobType,
      location: location ? location : job?.location,
      position: position ? position : job?.position,
      requirements: requirements ? requirements : job?.requirements,
      salary: salary ? salary : job?.salary,
      title: title ? title : job?.title,
    };

    const jobUpdate = await Job.findByIdAndUpdate(jobId, updateData, {
      new: true,
    });

    return res.status(200).json({
      message: "Job infomation updated",
      success: true,
      job: jobUpdate,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// [DELETE] /api/v1/job/deleteJob
export const deleteJob = async (req, res) => {
  try {
    const { jobId, companyId } = req.body;

    const existJob = await Job.findOne({
      _id: jobId,
      company: companyId,
    });

    if (!existJob) {
      return res.status(201).json({
        message: "Not found Job with this company!",
        success: false,
      });
    }

    await existJob.deleteOne();

    return res.status(200).json({
      message: "Delete successfully!",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting saved job:", error);
    return res.status(500).json({
      message: "An error occurred while deleting the saved job.",
      success: false,
    });
  }
};

// [GET] /api/v1/job/filters/positions
export const getJobPositions = async (req, res) => {
  try {
    const positions = await Job.distinct("title");
    return res.status(200).json({
      positions,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching positions:", error);
    return res.status(500).json({
      message: "An error occurred while fetching positions.",
      success: false,
    });
  }
};

// [GET] /api/v1/job/filters/locations
export const getJobLocations = async (req, res) => {
  try {
    const locations = await Job.distinct("location");
    return res.status(200).json({
      locations,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return res.status(500).json({
      message: "An error occurred while fetching locations.",
      success: false,
    });
  }
};

// ADMIN: [GET] /api/v1/job/admin/pending
export const getPendingJobsForAdmin = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "PENDING" })
      .populate({ path: "company", select: "name status" })
      .populate({ path: "created_by", select: "fullName email role" })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, jobs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ADMIN: [PUT] /api/v1/job/admin/:id/approve
export const approveJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status: "APPROVED", rejectedReason: "" },
      { new: true }
    ).populate({ path: "company", select: "name" });

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    await Activity.create({
      type: "JOB_APPROVED",
      actor: req.id,
      company: job.company?._id || job.company,
      job: job._id,
      message: `Job "${job.title}" approved${job.company?.name ? ` - ${job.company.name}` : ""}`,
    });

    return res.status(200).json({ success: true, message: "Job approved", job });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ADMIN: [PUT] /api/v1/job/admin/:id/reject
export const rejectJob = async (req, res) => {
  try {
    const { reason } = req.body;

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      {
        status: "REJECTED",
        rejectedReason: reason || "",
      },
      { new: true }
    ).populate({ path: "company", select: "name" });

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    await Activity.create({
      type: "JOB_REJECTED",
      actor: req.id,
      company: job.company?._id || job.company,
      job: job._id,
      message: `Job "${job.title}" rejected${job.company?.name ? ` - ${job.company.name}` : ""}`,
      meta: { reason: reason || "" },
    });

    return res.status(200).json({ success: true, message: "Job rejected", job });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
