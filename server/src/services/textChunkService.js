const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_CHUNK_OVERLAP = 200;

const createChunk = (text, start, end) => text.slice(start, end).trim();

export const splitTextIntoChunks = (
    text,
    { chunkSize = DEFAULT_CHUNK_SIZE, chunkOverlap = DEFAULT_CHUNK_OVERLAP } = {}
) => {
    const normalizedText = String(text || "").replace(/\r/g, "").trim();

    if (!normalizedText) {
        return [];
    }

    if (normalizedText.length <= chunkSize) {
        return [normalizedText];
    }

    const chunks = [];
    let start = 0;

    while (start < normalizedText.length) {
        const end = Math.min(start + chunkSize, normalizedText.length);
        const chunk = createChunk(normalizedText, start, end);

        if (chunk) {
            chunks.push(chunk);
        }

        if (end >= normalizedText.length) {
            break;
        }

        start = Math.max(end - chunkOverlap, start + 1);
    }

    return chunks;
};