import Knowledge from "../models/knowledge.js";
import { model, embeddingModel } from "../config/gemini.js";
import { cosineSimilarity } from "../utils/embedding.js";

/**
 * 🔹 Generate embedding
 */
const generateEmbedding = async (text) => {
    const result = await embeddingModel.embedContent({
        content: {
            parts: [{ text }],
        },
    });

    return result.embedding.values;
};

/**
 * ✅ Create Knowledge + embedding
 */
export const createKnowledge = async (req, res) => {
    try {
        const { title, content, tags } = req.body;

        const embedding = await generateEmbedding(content);

        const item = await Knowledge.create({
            title,
            content,
            tags,
            embedding,
        });

        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * ✅ Get all
 */
export const getKnowledge = async (req, res) => {
    const items = await Knowledge.find().sort({ createdAt: -1 });
    res.json(items);
};

/**
 * 🔥 Smart Search (semantic)
 */
export const searchKnowledge = async (req, res) => {
    try {
        const { query } = req.body;

        const queryEmbedding = await generateEmbedding(query);

        const all = await Knowledge.find();

        const scored = all.map((item) => ({
            ...item.toObject(),
            score: cosineSimilarity(queryEmbedding, item.embedding),
        }));

        const sorted = scored
            .sort((a, b) => b.score - a.score)
            .slice(0, 5); // top 5

        res.json(sorted);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * 🤖 Ask (smart AI)
 */
export const askKnowledge = async (req, res) => {
    try {
        const { question } = req.body;

        const queryEmbedding = await generateEmbedding(question);

        const all = await Knowledge.find();

        const top = all
            .map((item) => ({
                ...item.toObject(),
                score: cosineSimilarity(queryEmbedding, item.embedding),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

        const context = top
            .map(
                (item) =>
                    `Title: ${item.title}\nContent: ${item.content}`
            )
            .join("\n\n");

        const prompt = `
You are an AI assistant.

Answer ONLY from this knowledge:
${context}

Question:
${question}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;

        res.json({
            answer: response.text(),
            sources: top,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * ✨ Summarize
 */
export const summarizeKnowledge = async (req, res) => {
    try {
        const { content } = req.body;

        const result = await model.generateContent(
            `Summarize:\n${content}`
        );

        const response = await result.response;

        res.json({
            summary: response.text(),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};