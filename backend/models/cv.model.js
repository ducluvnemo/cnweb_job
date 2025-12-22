import mongoose from "mongoose";

const cvSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    templateType: {
        type: String,
        enum: ['simple', 'professional', 'modern', 'creative'],
        default: 'professional'
    },
    personalInfo: {
        fullName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: String,
        address: String,
        website: String,
        objective: String
    },
    experiences: [{
        title: String,
        company: String,
        startDate: String,
        endDate: String,
        current: {
            type: Boolean,
            default: false
        },
        description: String
    }],
    education: [{
        degree: String,
        school: String,
        startDate: String,
        endDate: String,
        description: String
    }],
    skills: [String],
    certifications: [{
        name: String,
        issuer: String,
        date: String
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export const CV = mongoose.model('CV', cvSchema);