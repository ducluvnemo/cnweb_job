import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { getResourceType, isPDF } from "../utils/cloudinaryHelper.js";
import { convertToRawUrl } from "../utils/urlHelper.js";
import { generateRandomNumber } from "../helpers/generate.js";
import { forgotPassword } from "../models/forgotPassword.model.js";
import { sendMail } from "../helpers/sendMail.js";

//[POST] /api/v1/user/register
export const register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role } = req.body;

    if (!fullName || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({
        message: "Something is missing!",
        success: false,
      });
    }
    const file = req.file;
    let profilePhoto = "";
    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        resource_type: "auto",
        access_mode: "public",
        folder: "profile_photos",
      });
      profilePhoto = cloudResponse.secure_url;
    }

    const user = await User.findOne({
      email,
    });
    if (user) {
      return res.status(400).json({
        message: "User already exists with this email!",
        success: false,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      profile: {
        profilePhoto,
      },
    });
    return res.status(201).json({
      message: "Account created successfully!",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

//[POST] /api/v1/user/login
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Something is missing!",
        success: false,
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Password or Email incorrect!",
        success: false,
      });
    }

    if (user.locked === true) {
      return res.status(400).json({
        message: "Account has been locked!",
        success: false,
      });
    }

    if (user.deleted === true) {
      return res.status(400).json({
        message: "Account has been deleted!",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Password or Email incorrect!",
        success: false,
      });
    }

    if (role && role !== user.role) {
      return res.status(400).json({
        message: "Account doesn't exist with current role!",
        success: false,
      });
    }

    const tokenData = {
      userId: user._id,
    };

    const token = jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    const safeUser = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

   return res
  .status(200)
  .cookie("token", token, {
    maxAge: 1 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
    secure: false,   // dev HTTP
    path: "/",       
  })
  .json({
    message: `Welcome back ${safeUser.fullName}`,
    user: safeUser,
    success: true,
  });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

//[GET] /api/v1/user/logout
export const logout = async (req, res) => {
  res.clearCookie("token", { path: "/" });
  res.clearCookie("token", { path: "/api/v1/user" }); // xoá cookie cũ nếu từng set theo path này
  return res.status(200).json({ message: "Logout successfully!", success: true });
};

//[POST] /api/v1/user/profile/update
export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, bio, skills } = req.body;
    const file = req.file;
    console.log(
      "Upload file info:",
      file
        ? {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
          }
        : "No file uploaded"
    );

    let cloudResponse;
    if (file) {
      try {
        const fileUri = getDataUri(file);
        console.log("File URI generated:", fileUri ? "Success" : "Failed");
        console.log("File type:", file.mimetype);

        const resourceType = getResourceType(file.mimetype);
        console.log("Using resource type:", resourceType);

        // Upload with appropriate resource type
        cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
          resource_type: resourceType,
          public_id: `resume_${Date.now()}`,
          folder: "resumes",
          access_mode: "public",
        });

        console.log("Cloudinary upload success:", cloudResponse.secure_url);
        console.log("Public ID:", cloudResponse.public_id);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({
          message: "Failed to upload file to Cloudinary",
          success: false,
        });
      }
    }

    const skillsArray = skills ? skills.split(",") : undefined;
    const userID = req.id;

    const user = await User.findById(userID);
    if (!user) {
      return res.status(400).json({
        message: "User not found!",
        success: false,
      });
    }

    // Update user data
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skillsArray) user.profile.skills = skillsArray;

    if (cloudResponse) {
      const finalUrl = isPDF(file.mimetype)
        ? convertToRawUrl(cloudResponse.secure_url)
        : cloudResponse.secure_url;

      user.profile.resume = finalUrl;
      user.profile.resumeOriginalName = file.originalname;
      console.log("Final URL saved:", finalUrl);
    }

    await user.save();

    const updatedUser = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res.status(200).json({
      message: "Profile updated successfully!",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while updating the profile.",
      success: false,
    });
  }
};

//[POST] /api/v1/user/password/forgot
export const forgotPasswordPost = async (req, res) => {
  try {
    const { email } = req.body;
    const userExist = await User.findOne({
      email,
    });
    if (!userExist) {
      return res.status(401).json({
        message: "User not found",
        success: false,
      });
    }

    const otp = generateRandomNumber(8);
    const objectForgotPassword = {
      email,
      otp,
      expireAt: Date.now(),
    };

    const forgot = new forgotPassword(objectForgotPassword);
    await forgot.save();

    const subject = "Mã OTP xác minh lấy lại mật khẩu: ";
    const html = `
            Mã OTP để lấy lại mật khẩu là <b>${otp}</b>. Thời hạn sử dụng 1 phút.
        `;

    sendMail(email, subject, html);

    return res.status(200).json({
      message: "Send OTP successfully!",
      success: true,
      email,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

//[POST] /api/v1/user/password/forgot/otp
export const forgotPasswordPostOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const checkExistOtp = await forgotPassword.findOne({
      email,
      otp,
    });
    if (!checkExistOtp) {
      return res.status(401).json({
        message: "OTP is not correct",
        success: false,
      });
    }
    return res.status(200).json({
      message: "OTP is correct",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

//[POST] /api/v1/user/password/reset
export const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "Something is missing!",
      success: false,
    });
  }
  const user = await User.findOne({
    email: email,
  });
  if (!user) {
    return res.status(400).json({
      message: "User don't exist with this email!",
      success: false,
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  if (hashedPassword === user.password) {
    return res.status(400).json({
      message: "password already exists",
      success: false,
    });
  }
  user.password = hashedPassword;
  await user.save();
  return res.status(200).json({
    message: "Reset password successfully!",
    success: true,
  });
};

//[POST] /profile/update/img
export const updateImageProfile = async (req, res) => {
  const file = req.file;
  const userId = req.id;
  const user = await User.findOne({
    _id: userId,
  });
  if (!file) {
    return res.status(401).json({
      message: "Image not found!",
      success: false,
    });
  }
  if (!user) {
    return res.status(401).json({
      message: "User not found!",
      success: false,
    });
  }
  let cloudResponse;
  if (file) {
    const fileUri = getDataUri(file);
    cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
      resource_type: "auto",
      access_mode: "public",
      folder: "profile_photos",
    });
  }
  if (cloudResponse) {
    user.profile.profilePhoto = cloudResponse.secure_url;
  }
  await user.save();
  return res.status(200).json({
    message: "Update image successfully!",
    success: true,
    user,
  });
};

//[GET] /admin/listUserAdmin
export const ListUserAdmin = async (req, res) => {
  const usersAdmin = await User.find({
    deleted: false,
    role: "recruiter",
  });
  const users = await User.find({
    deleted: false,
    role: "student",
  });

  if (!users || !usersAdmin) {
    return res.status(401).json({
      message: "No account yet",
      success: false,
    });
  }
  return res.status(200).json({
    success: true,
    usersAdmin,
    users,
  });
};

//[POST] /admin/lockAccount
export const LockAccount = async (req, res) => {
  try {
    const { locked, id } = req.body;
    const user = await User.findOne({
      _id: id,
    });
    if (!user) {
      return res.status(401).json({
        message: "User not found!",
        success: false,
      });
    }
    user.locked = locked;
    await user.save();
    return res.status(200).json({
      message: "Change status successfully!",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

//[POST] /admin/deleteAccount
export const DeleteAccount = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findOne({
      _id: id,
    });
    if (!user) {
      return res.status(401).json({
        message: "User not found!",
        success: false,
      });
    }
    if (user.deleted) {
      return res.status(401).json({
        message: "Account has been deleted!",
        success: false,
      });
    }
    user.deleted = true;
    await user.save();

    return res.status(200).json({
      message: "Deleted successfully!",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }

};

export const getApplicants = async (req, res) => {
  const users = await User.find({ role: "JOB_APPLICANT" });
  res.json(users);
};

