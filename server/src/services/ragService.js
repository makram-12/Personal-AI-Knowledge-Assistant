import { model } from "../config/gemini.js";
import { buildRagContext, searchKnowledgeChunks } from "./knowledgeService.js";

const formatHistory = (messages = []) =>
    messages
        .slice(-8)
        .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
        .join("\n");

export const answerWithRag = async ({
    userId,
    question,
    history = [],
    topK = 5,
}) => {
    const relevantChunks = await searchKnowledgeChunks({
        userId,
        query: question,
        topK,
    });

    const context = buildRagContext(relevantChunks);
    const conversation = formatHistory(history);

    const prompt = `You are a production-grade personal knowledge assistant.
Use the provided context only. If the answer is not in the context, say that you do not have enough information.

Context:
${context || "No relevant context found."}

Conversation:
${conversation || "No prior conversation."}

User question:
${question}

Answer with a concise and helpful response.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return {
        answer: response.text(),
        sources: relevantChunks.map((chunk) => ({
            id: chunk._id,
            documentId: chunk.documentId?._id || chunk.documentId,
            title: chunk.documentId?.title || "Untitled",
            chunkIndex: chunk.chunkIndex,
            score: chunk.score,
            text: chunk.text,
        })),
    };
};