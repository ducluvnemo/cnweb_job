import {
    CV
} from "../models/cv.model.js";

// Tạo mới CV
export const createCV = async (req, res) => {
    try {
        const userId = req.id; // từ middleware authentication
        const {
            templateType,
            personalInfo,
            experiences,
            education,
            skills,
            certifications
        } = req.body;

        const cv = await CV.create({
            user: userId,
            templateType,
            personalInfo,
            experiences,
            education,
            skills,
            certifications
        });

        return res.status(201).json({
            success: true,
            message: "CV đã được tạo thành công",
            cv
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi tạo CV"
        });
    }
};

// Lấy tất cả CV của user
export const getMyCVs = async (req, res) => {
    try {
        const userId = req.id;
        const cvs = await CV.find({
            user: userId
        }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            cvs
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách CV"
        });
    }
};

// Lấy CV theo ID
export const getCVById = async (req, res) => {
    try {
        const cvId = req.params.id;
        const cv = await CV.findById(cvId);

        if (!cv) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy CV"
            });
        }

        return res.status(200).json({
            success: true,
            cv
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi lấy CV"
        });
    }
};

// Cập nhật CV
export const updateCV = async (req, res) => {
    try {
        const cvId = req.params.id;
        const userId = req.id;
        const {
            templateType,
            personalInfo,
            experiences,
            education,
            skills,
            certifications
        } = req.body;

        const cv = await CV.findOne({
            _id: cvId,
            user: userId
        });

        if (!cv) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy CV hoặc bạn không có quyền chỉnh sửa"
            });
        }

        cv.templateType = templateType || cv.templateType;
        cv.personalInfo = personalInfo || cv.personalInfo;
        cv.experiences = experiences || cv.experiences;
        cv.education = education || cv.education;
        cv.skills = skills || cv.skills;
        cv.certifications = certifications || cv.certifications;

        await cv.save();

        return res.status(200).json({
            success: true,
            message: "CV đã được cập nhật",
            cv
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật CV"
        });
    }
};

// Xóa CV
export const deleteCV = async (req, res) => {
    try {
        const cvId = req.params.id;
        const userId = req.id;

        const cv = await CV.findOneAndDelete({
            _id: cvId,
            user: userId
        });

        if (!cv) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy CV hoặc bạn không có quyền xóa"
            });
        }

        return res.status(200).json({
            success: true,
            message: "CV đã được xóa"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi xóa CV"
        });
    }
};