import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const chatModelName =
    process.env.GEMINI_CHAT_MODEL || "gemini-3-flash-preview";

const embeddingModelName =
    process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";

const embeddingFallbackModels = [
    embeddingModelName,
    "gemini-embedding-001",
    "embedding-001",
].filter((value, index, arr) => value && arr.indexOf(value) === index);

export async function generateText(prompt) {
    const response = await ai.models.generateContent({
        model: chatModelName,
        contents: prompt,
    });

    return response.text;
}

export async function embedText(text) {
    let lastError = null;

    for (const modelName of embeddingFallbackModels) {
        try {
            const result = await ai.models.embedContent({
                model: modelName,
                contents: text,
            });

            if (Array.isArray(result?.embeddings) && result.embeddings.length > 0) {
                return result.embeddings[0]?.values || [];
            }

            if (Array.isArray(result?.embedding?.values)) {
                return result.embedding.values;
            }

            if (Array.isArray(result?.embedding)) {
                return result.embedding;
            }

            return [];
        } catch (error) {
            lastError = error;

            const isNotFound =
                error?.status === "NOT_FOUND" ||
                error?.error?.status === "NOT_FOUND" ||
                String(error?.message || "").includes("NOT_FOUND") ||
                String(error?.message || "").includes("is not found");

            if (!isNotFound) {
                throw error;
            }
        }
    }

    throw lastError || new Error("No compatible embedding model available");
}

// Backward-compatible model export used by current services/controllers.
export const model = {
    async generateContent(prompt) {
        const text = await generateText(prompt);

        return {
            response: {
                text: () => text,
            },
        };
    },
};

// Backward-compatible embedding model export used by embeddingService.
export const embeddingModel = {
    async embedContent({ content }) {
        const inputText =
            typeof content === "string"
                ? content
                : content?.parts?.map((part) => part?.text || "").join("\n") || "";

        const values = await embedText(inputText);

        return {
            embedding: {
                values,
            },
        };
    },
};