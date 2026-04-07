import { model } from "../config/gemini.js";
import {
    buildRagContext,
    ingestKnowledgeDocument,
    listKnowledgeDocuments,
    searchKnowledgeChunks,
} from "../services/knowledgeService.js";
import { answerWithRag } from "../services/ragService.js";

export const createKnowledge = async (req, res) => {
    try {
        const document = await ingestKnowledgeDocument({
            userId: req.user.id,
            title: req.body.title,
            content: req.body.content,
            tags: req.body.tags,
            sourceType: req.body.sourceType,
            metadata: req.body.metadata,
        });

        res.status(201).json(document);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

export const getKnowledge = async (req, res) => {
    try {
        const result = await listKnowledgeDocuments({
            userId: req.user.id,
            page: req.query.page,
            limit: req.query.limit,
        });

        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

export const searchKnowledge = async (req, res) => {
    try {
        const chunks = await searchKnowledgeChunks({
            userId: req.user.id,
            query: req.body.query,
            topK: req.body.topK,
        });

        res.json({
            context: buildRagContext(chunks),
            results: chunks,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const askKnowledge = async (req, res) => {
    try {
        const result = await answerWithRag({
            userId: req.user.id,
            question: req.body.question,
        });

        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

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