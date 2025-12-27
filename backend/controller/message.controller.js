import {
    Message
} from "../models/message.model.js";
import {
    User
} from "../models/user.model.js";
import {
    Application
} from "../models/application.model.js";
import {
    Job
} from "../models/job.model.js";

// Socket.io instance được set từ index.js
export let io;

export const setIO = (ioInstance) => {
    io = ioInstance;
};

// [POST] /api/v1/message/send/:receiverId
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.receiverId;
        const {
            content
        } = req.body;

        console.log("SendMessage request - senderId:", senderId, "receiverId:", receiverId, "content:", content);

        if (!senderId) {
            return res.status(401).json({
                message: "Unauthorized - no sender ID",
                success: false
            });
        }

        if (!receiverId) {
            return res.status(400).json({
                message: "Receiver ID is required",
                success: false
            });
        }

        if (!content || content.trim() === "") {
            return res.status(400).json({
                message: "Message content cannot be empty",
                success: false
            });
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({
                message: "Receiver not found",
                success: false
            });
        }

        // Get current user
        const sender = await User.findById(senderId);
        if (!sender) {
            return res.status(404).json({
                message: "Sender not found",
                success: false
            });
        }

        // Check if they have an accepted application relationship
        let hasAcceptedApplication = false;

        if (sender.role === "recruiter" && receiver.role === "student") {
            // Recruiter sending to student: check if student has accepted application in recruiter's jobs
            const recruiterJobs = await Job.find({
                created_by: senderId
            }).select("_id");
            const jobIds = recruiterJobs.map(j => j._id);

            const acceptedApp = await Application.findOne({
                job: {
                    $in: jobIds
                },
                applicant: receiverId,
                status: "accepted"
            });

            hasAcceptedApplication = !!acceptedApp;
        } else if (sender.role === "student" && receiver.role === "recruiter") {
            // Student sending to recruiter: check if student has accepted application in recruiter's jobs
            const recruiterJobs = await Job.find({
                created_by: receiverId
            }).select("_id");
            const jobIds = recruiterJobs.map(j => j._id);

            const acceptedApp = await Application.findOne({
                job: {
                    $in: jobIds
                },
                applicant: senderId,
                status: "accepted"
            });

            hasAcceptedApplication = !!acceptedApp;
        }

        if (!hasAcceptedApplication) {
            return res.status(403).json({
                message: "You can only chat with users who have accepted applications",
                success: false
            });
        }

        // Create new message
        const newMessage = await Message.create({
            sender: senderId,
            receiver: receiverId,
            content: content.trim()
        });

        const populatedMessage = await newMessage.populate([{
                path: 'sender',
                select: '-password'
            },
            {
                path: 'receiver',
                select: '-password'
            }
        ]);

        return res.status(201).json({
            message: "Message sent successfully",
            data: populatedMessage,
            success: true
        });
    } catch (error) {
        console.log("Error in sendMessage:", error);
        return res.status(500).json({
            message: error.message || "Error sending message",
            success: false
        });
    }
};

// [GET] /api/v1/message/get/:userId
// Get all conversations with a specific user
export const getMessages = async (req, res) => {
    try {
        const currentUserId = req.id;
        const otherUserId = req.params.userId;

        if (!otherUserId) {
            return res.status(400).json({
                message: "User ID is required",
                success: false
            });
        }

        const messages = await Message.find({
            $or: [{
                    sender: currentUserId,
                    receiver: otherUserId
                },
                {
                    sender: otherUserId,
                    receiver: currentUserId
                }
            ]
        }).sort({
            createdAt: 1
        }).populate([{
                path: 'sender',
                select: '-password'
            },
            {
                path: 'receiver',
                select: '-password'
            }
        ]);

        return res.status(200).json({
            messages,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error fetching messages",
            success: false
        });
    }
};

// [GET] /api/v1/message/conversations
// Get all users that current user has chatted with (only those with accepted applications)
export const getConversations = async (req, res) => {
    try {
        const userId = req.id;

        // Get current user to check role
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        let allowedPartnerIds = [];

        if (currentUser.role === "recruiter") {
            // Get all jobs created by this recruiter
            const recruiterJobs = await Job.find({
                created_by: userId
            }).select("_id");
            const jobIds = recruiterJobs.map(j => j._id);

            // Get all accepted applications for these jobs
            const acceptedApps = await Application.find({
                job: {
                    $in: jobIds
                },
                status: "accepted"
            }).select("applicant");

            allowedPartnerIds = acceptedApps.map(app => app.applicant.toString());
        } else if (currentUser.role === "student") {
            // Get all accepted applications for this student
            const acceptedApps = await Application.find({
                applicant: userId,
                status: "accepted"
            }).populate("job", "created_by").select("job");

            allowedPartnerIds = acceptedApps.map(app => app.job.created_by.toString());
        }

        // Get messages only with allowed partners
        const messages = await Message.find({
            $or: [{
                    sender: userId,
                    receiver: {
                        $in: allowedPartnerIds
                    }
                },
                {
                    sender: {
                        $in: allowedPartnerIds
                    },
                    receiver: userId
                }
            ]
        }).sort({
            createdAt: -1
        });

        // Get unique conversation partners
        const conversationMap = new Map();

        messages.forEach(msg => {
            const partnerId = msg.sender.toString() === userId ? msg.receiver.toString() : msg.sender.toString();
            if (!conversationMap.has(partnerId)) {
                conversationMap.set(partnerId, {
                    userId: partnerId,
                    lastMessage: msg.content,
                    lastMessageTime: msg.createdAt,
                    sender: msg.sender.toString() === userId
                });
            }
        });

        const conversationUserIds = Array.from(conversationMap.keys());

        const users = await User.find({
            _id: {
                $in: conversationUserIds
            }
        }).select('_id fullName email profile.profilePhoto');

        const conversations = users.map(user => {
            const convInfo = conversationMap.get(user._id.toString());
            return {
                user,
                lastMessage: convInfo.lastMessage,
                lastMessageTime: convInfo.lastMessageTime,
                isLastMessageFromMe: convInfo.sender
            };
        }).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

        return res.status(200).json({
            conversations,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error fetching conversations",
            success: false
        });
    }
};