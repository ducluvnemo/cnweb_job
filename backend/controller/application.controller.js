import {
    Application
} from "../models/application.model.js";
import {
    Job
} from "../models/job.model.js";
import { Message } from "../models/message.model.js";

//[POST] /api/v1/application/apply/:id
export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;
        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required",
                success: false
            })
        }

        //check if the user has already applied for the job
        const existApplication = await Application.findOne({
            job: jobId,
            applicant: userId
        });
        if (existApplication) {
            return res.status(400).json({
                message: "You have already applied for this job",
                success: false
            })
        }

        //check if the jobs exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(400).json({
                message: "Job not found!",
                success: false
            })
        }

        //create new application
        const newApplication = await Application.create({
            job: jobId,
            applicant: userId
        })
        
        job.applications.push(newApplication._id);
        await job.save();

        return res.status(201).json({
            message: "Job apply successfully!",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

//user 
//lấy ra các đơn user đã apply
//[GET] /api/v1/application/get
export const getAppliedJobs = async(req,res) => {
    try {
        const userID = req.id;
        const application = await Application.find({applicant: userID}).sort({createdAt: -1}).populate(
            [
                {
                    path: 'job',
                    options: {sort: {createdAt: -1}},
                    populate: {
                        path: 'company'
                    }
                },
                {
                    path: 'applicant',
                    options: {sort: {createdAt: -1}},
                    select: "-password"
                }
            ]
        );
        if(!application){
            return res.status(404).json({
                message: "No Applications",
                success: false
            })
        }
        return res.status(200).json({
            application,
            message: true
        })
    } catch (error) {
        console.log(error);
    }
}

//admin
//Lấy ra các đơn ứng tuyển từ 1 job
//[GET] /api/v1/application/:id/applicants
export const getApplicants = async (req,res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: 'applications',
            options: {sort: {createdAt: -1}},
            populate: {
                path: 'applicant',
                options: {sort: {createdAt: -1}},
                select: "-password"
            }
        })
        if(!job){
            return res.status(404).json({
                message: 'job not found!',
                success: false
            })
        }
        return res.status(200).json({
            job,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

//[PATCH] /api/v1/application/status/:id/update
export const updateStatus = async (req,res) => {
    try {
        const status = req.body.status;
        const applicationId = req.params.id;
        if(!status){
            return res.status(400).json({
                message: "status is required!",
                success: false
            })
        }

        //find the application by appicantion id
        const application = await Application.findOne({_id: applicationId}).populate('applicant');
        if(!application){
            return res.status(404).json({
                message: "Application not found!",
                success: false
            })
        }

        // update the status 
        application.status = status.toLowerCase();
        await application.save();

        // If status is accepted, send automatic "hello" message
        if(status.toLowerCase() === 'accepted') {
            const recruiterId = req.id; // Current user is the recruiter
            const applicantId = application.applicant._id;

            try {
                await Message.create({
                    sender: recruiterId,
                    receiver: applicantId,
                    content: "hello"
                });
            } catch (error) {
                console.log("Error sending message:", error);
                // Don't fail the accept request if message fails
            }
        }

        return res.status(201).json({
            message: "Status updated successfully!",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}