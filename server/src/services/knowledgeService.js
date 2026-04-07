import KnowledgeDocument from "../models/KnowledgeDocument.js";
import KnowledgeChunk from "../models/KnowledgeChunk.js";
import { generateEmbedding } from "./embeddingService.js";
import { splitTextIntoChunks } from "./textChunkService.js";
import { cosineSimilarity } from "../utils/embedding.js";

const chunkToRecord = async ({ userId, documentId, chunkText, chunkIndex }) => {
    const embedding = await generateEmbedding(chunkText);

    return {
        userId,
        documentId,
        chunkIndex,
        text: chunkText,
        embedding,
        tokenCount: chunkText.split(/\s+/).filter(Boolean).length,
    };
};

export const ingestKnowledgeDocument = async ({
    userId,
    title,
    content,
    tags = [],
    sourceType = "text",
    metadata = {},
}) => {
    const normalizedContent = String(content || "").trim();

    if (!normalizedContent) {
        const error = new Error("Content is required");
        error.statusCode = 400;
        throw error;
    }

    const chunks = splitTextIntoChunks(normalizedContent);

    const document = await KnowledgeDocument.create({
        userId,
        title: String(title || "Untitled").trim(),
        content: normalizedContent,
        tags,
        sourceType,
        chunkCount: chunks.length,
        metadata,
    });

    const chunkRecords = [];

    for (let index = 0; index < chunks.length; index += 1) {
        chunkRecords.push(
            await chunkToRecord({
                userId,
                documentId: document._id,
                chunkText: chunks[index],
                chunkIndex: index,
            })
        );
    }

    if (chunkRecords.length > 0) {
        await KnowledgeChunk.insertMany(chunkRecords);
    }

    return document;
};

export const listKnowledgeDocuments = async ({ userId, page = 1, limit = 25 }) => {
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 100);
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await Promise.all([
        KnowledgeDocument.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
        KnowledgeDocument.countDocuments({ userId }),
    ]);

    return {
        items,
        page: safePage,
        limit: safeLimit,
        total,
    };
};

export const searchKnowledgeChunks = async ({ userId, query, topK = 5 }) => {
    const queryEmbedding = await generateEmbedding(query);

    if (!queryEmbedding.length) {
        return [];
    }

    const chunks = await KnowledgeChunk.find({ userId })
        .populate("documentId", "title tags sourceType")
        .lean();

    const scored = chunks
        .map((chunk) => ({
            ...chunk,
            score: cosineSimilarity(queryEmbedding, chunk.embedding),
        }))
        .filter((chunk) => chunk.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.max(Number(topK) || 5, 1));

    return scored;
};

export const buildRagContext = (chunks, maxCharacters = 4000) => {
    const sections = [];
    let totalCharacters = 0;

    for (const chunk of chunks) {
        const title = chunk.documentId?.title || "Untitled";
        const section = `Source: ${title}\nChunk: ${chunk.text}`;

        if (totalCharacters + section.length > maxCharacters && sections.length > 0) {
            break;
        }

        sections.push(section);
        totalCharacters += section.length;
    }

    return sections.join("\n\n");
};