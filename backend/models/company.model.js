import mongoose from "mongoose";

const companySchemal = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    website: {
        type: String,
    },
    location: {
        type: String,
    },
    logo: {
        type: String, //URL to company
    },
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING",
  },
}, { timestamps: true });

export const Company = mongoose.model("Company", companySchemal);
