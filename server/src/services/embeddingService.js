import crypto from "crypto";
import { embedText } from "../config/gemini.js";

const embeddingCache = new Map();
const MAX_CACHE_SIZE = 500;

const getCacheKey = (text) => crypto.createHash("sha256").update(text).digest("hex");

const rememberEmbedding = (key, values) => {
    if (embeddingCache.has(key)) {
        embeddingCache.delete(key);
    }

    embeddingCache.set(key, values);

    if (embeddingCache.size > MAX_CACHE_SIZE) {
        const oldestKey = embeddingCache.keys().next().value;
        embeddingCache.delete(oldestKey);
    }
};

export const generateEmbedding = async (text) => {
    const normalizedText = String(text || "").trim();

    if (!normalizedText) {
        return [];
    }

    const cacheKey = getCacheKey(normalizedText);

    if (embeddingCache.has(cacheKey)) {
        return embeddingCache.get(cacheKey);
    }

    const rawValues = await embedText(normalizedText);
    const values = Array.isArray(rawValues) ? rawValues : [];
    rememberEmbedding(cacheKey, values);

    return values;
};