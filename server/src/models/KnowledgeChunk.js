import mongoose from "mongoose";

const knowledgeChunkSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "KnowledgeDocument",
            required: true,
            index: true,
        },
        chunkIndex: {
            type: Number,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        embedding: {
            type: [Number],
            default: [],
        },
        tokenCount: {
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

knowledgeChunkSchema.index({ userId: 1, documentId: 1, chunkIndex: 1 });

export default mongoose.model("KnowledgeChunk", knowledgeChunkSchema);