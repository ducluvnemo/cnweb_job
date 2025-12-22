import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { Activity } from "../models/activity.model.js";

const fillDailySeries = (raw, days) => {
  const map = new Map();
  raw.forEach((r) => {
    const date = r._id.date;
    const role = r._id.role;
    if (!map.has(date)) map.set(date, { date, student: 0, recruiter: 0 });
    map.get(date)[role] = r.count;
  });

  const out = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push(map.get(key) || { date: key, student: 0, recruiter: 0 });
  }
  return out;
};

const fillDailyCount = (raw, days, fieldName) => {
  const map = new Map(raw.map((r) => [r._id, r.count]));
  const out = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, [fieldName]: map.get(key) || 0 });
  }
  return out;
};

export const getAdminDashboardDetails = async (req, res) => {
  try {
    const type = String(req.query.type || "");
    const days = Math.max(7, Math.min(Number(req.query.days || 30), 180));
    const limit = Math.max(1, Math.min(Number(req.query.limit || 50), 200));

    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    let items = [];

    if (type === "newRecruiters") {
      items = await User.find({ role: "recruiter", createdAt: { $gte: start } })
        .select("fullName email createdAt")
        .sort({ createdAt: -1 })
        .limit(limit);
    } else if (type === "newJobSeekers") {
      items = await User.find({ role: "student", createdAt: { $gte: start } })
        .select("fullName email createdAt")
        .sort({ createdAt: -1 })
        .limit(limit);
    } else if (type === "jobsApproved") {
      items = await Job.find({ status: "APPROVED" })
        .select("title status createdAt updatedAt")
        .sort({ updatedAt: -1 })
        .limit(limit);
    } else if (type === "jobsRejected") {
      items = await Job.find({ status: "REJECTED" })
        .select("title status createdAt updatedAt")
        .sort({ updatedAt: -1 })
        .limit(limit);
    } else {
      return res.status(400).json({ success: false, message: "Invalid type" });
    }

    return res.status(200).json({ success: true, type, days, items });
  } catch (e) {
    console.error("getAdminDashboardDetails error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    const days = Math.max(7, Math.min(Number(req.query.days || 30), 180));

    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const usersAgg = await User.aggregate([
      { $match: { createdAt: { $gte: start }, role: { $in: ["student", "recruiter"] } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            role: "$role",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    const jobsAgg = await Job.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const appsAgg = await Application.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const [newRecruiters, newJobSeekers, jobsActive] = await Promise.all([
      User.countDocuments({ role: "recruiter", createdAt: { $gte: start } }),
      User.countDocuments({ role: "student", createdAt: { $gte: start } }),
      Job.countDocuments({ status: "APPROVED" }),
    ]);

    const jobsTotal = await Job.countDocuments();
    const jobsRejected = await Job.countDocuments({ status: "REJECTED" });
    const rejectionRate = jobsTotal === 0 ? 0 : Number(((jobsRejected / jobsTotal) * 100).toFixed(2));

    return res.status(200).json({
      success: true,
      range: { days },
      kpi: {
        newRecruiters,
        newJobSeekers,
        jobsActive,
        jobsTotal,
        jobsRejected,
        rejectionRate,
      },
      charts: {
        usersDaily: fillDailySeries(usersAgg, days),
        jobsDaily: fillDailyCount(jobsAgg, days, "jobs"),
        applicationsDaily: fillDailyCount(appsAgg, days, "applications"),
      },
    });
  } catch (e) {
    console.error("getAdminDashboard error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAdminActivity = async (req, res) => {
  try {
    const days = Math.max(1, Math.min(Number(req.query.days || 30), 365));
    const limit = Math.max(1, Math.min(Number(req.query.limit || 10), 50));

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const items = await Activity.find({ createdAt: { $gte: since } })
      .populate({ path: "actor", select: "fullName email role" })
      .populate({ path: "company", select: "name status" })
      .populate({ path: "job", select: "title status" })
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({ success: true, items });
  } catch (e) {
    console.error("getAdminActivity error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPendingJobsQuick = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(Number(req.query.limit || 6), 50));

    const jobs = await Job.find({ status: "PENDING" })
      .select("title status createdAt company created_by")
      .populate({ path: "company", select: "name status" })
      .populate({ path: "created_by", select: "fullName email role" })
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({ success: true, jobs });
  } catch (e) {
    console.error("getPendingJobsQuick error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
