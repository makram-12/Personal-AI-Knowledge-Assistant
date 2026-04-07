import mongoose from "mongoose";

const knowledgeDocumentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        sourceType: {
            type: String,
            enum: ["text", "document"],
            default: "text",
        },
        chunkCount: {
            type: Number,
            default: 0,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true }
);

knowledgeDocumentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("KnowledgeDocument", knowledgeDocumentSchema);