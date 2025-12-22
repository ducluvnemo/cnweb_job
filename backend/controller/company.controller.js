import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";
import { Activity } from "../models/activity.model.js";


// [POST] /api/v1/company/register
export const registerCompany = async (req, res) => {
  try {
    const { companyName, logo } = req.body;

    if (!companyName) {
      return res.status(400).json({
        message: "Company Name is Require",
        success: false,
      });
    }

    let company = await Company.findOne({ name: companyName });
    if (company) {
      return res.status(400).json({
        message: "You can't register same company",
        success: false,
      });
    }

    company = await Company.create({
      name: companyName,
      logo: logo,
      userId: req.id,
      status: "PENDING",
    });

    await Activity.create({
        type: "COMPANY_CREATED",
        actor: req.id,
        company: company._id,
        message: `Company "${company.name}" created (PENDING)`,
    });


    return res.status(201).json({
      message: "Company register successfully",
      success: true,
      company,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// [GET] /api/v1/company/get
export const getCompany = async (req, res) => {
  try {
    const userId = req.id;
    const companies = await Company.find({ userId });

    return res.status(200).json({
      success: true,
      companies,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// [GET] /api/v1/company/get/:id
export const getCompanyById = async (req, res) => {
  try {
    const companyID = req.params.id;
    const company = await Company.findById(companyID);

    if (!company) {
      return res.status(404).json({
        message: "company not found",
        success: false,
      });
    }

    return res.status(200).json({
      company,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// [PATCH] /api/v1/company/update/:id
export const updateCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;
    const file = req.file;

    let cloudResponse;
    let logo;

    if (file) {
      const fileUri = getDataUri(file);
      cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        resource_type: "auto",
        access_mode: "public",
        folder: "company_logos",
      });
      logo = cloudResponse.secure_url;
    }

    const companyBeforeUpdate = await Company.findOne({ _id: req.params.id });
    if (!companyBeforeUpdate) {
      return res.status(404).json({
        message: "Company not found!",
        success: false,
      });
    }

    const updateData = {
      name: name ? name : companyBeforeUpdate.name,
      description: description ? description : companyBeforeUpdate.description,
      website: website ? website : companyBeforeUpdate.website,
      location: location ? location : companyBeforeUpdate.location,
      logo: logo ? logo : companyBeforeUpdate.logo,
    };

    await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });

    return res.status(200).json({
      message: "Company infomation updated",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// [DELETE] /api/v1/company/deleteCompany
export const deleteCompany = async (req, res) => {
  try {
    const { companyId } = req.body;

    const existCompany = await Company.findOne({ _id: companyId });
    if (!existCompany) {
      return res.status(404).json({
        message: "Not found company!",
        success: false,
      });
    }

    await Job.deleteMany({ company: companyId });
    await existCompany.deleteOne();

    return res.status(200).json({
      message: "Delete Company successfully!",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ADMIN: [GET] /api/v1/company/admin/pending
export const getPendingCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ status: "PENDING" }).populate({
      path: "userId",
      select: "fullName email role",
    });

    return res.status(200).json({ success: true, companies });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ADMIN: [PUT] /api/v1/company/admin/:id/approve
export const approveCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { status: "APPROVED" },
      { new: true }
    );

    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }

    await Activity.create({
        type: "COMPANY_APPROVED",
        actor: req.id,
        company: company._id,
        message: `Company "${company.name}" approved`,
    });
 
    return res
      .status(200)
      .json({ success: true, message: "Company approved", company });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ADMIN: [PUT] /api/v1/company/admin/:id/reject
export const rejectCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { status: "REJECTED" },
      { new: true }
    );

    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }

    await Activity.create({
  type: "COMPANY_REJECTED",
  actor: req.id,
  company: company._id,
  message: `Company "${company.name}" rejected`,
});

    return res
      .status(200)
      .json({ success: true, message: "Company rejected", company });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ADMIN: [DELETE] /api/v1/company/admin/:id
export const deleteCompanyByAdmin = async (req, res) => {
  try {
    const companyId = req.params.id;

    const company = await Company.findById(companyId);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }

    await Job.deleteMany({ company: companyId });
    await company.deleteOne();

    return res
      .status(200)
      .json({ success: true, message: "Company deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
