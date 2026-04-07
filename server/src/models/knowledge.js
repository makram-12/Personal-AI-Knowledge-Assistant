import mongoose from "mongoose";

const knowledgeSchema = new mongoose.Schema(
    {
        title: String,
        content: String,
        tags: [String],

        embedding: {
            type: [Number],
            default: [],
        },
    },
    { timestamps: true }
);

export default mongoose.model("Knowledge", knowledgeSchema);