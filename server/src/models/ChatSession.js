import mongoose from "mongoose";

const chatSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            default: "New chat",
            trim: true,
        },
        summary: {
            type: String,
            default: "",
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

chatSessionSchema.index({ userId: 1, lastMessageAt: -1 });

export default mongoose.model("ChatSession", chatSessionSchema);