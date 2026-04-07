import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
});

// هنستخدمه للـ embeddings (hack بسيط)
export const embeddingModel = genAI.getGenerativeModel({
    model: "gemini-embedding-001",
});