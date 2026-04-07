import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";
import { answerWithRag } from "./ragService.js";

const createSessionTitle = (message) => {
    const trimmed = String(message || "").trim();
    return trimmed.slice(0, 60) || "New chat";
};

export const createChatSession = async ({ userId, title }) => {
    return ChatSession.create({
        userId,
        title: title ? String(title).trim() : "New chat",
    });
};

export const listChatSessions = async ({ userId }) => {
    return ChatSession.find({ userId }).sort({ lastMessageAt: -1 }).lean();
};

export const getChatMessages = async ({ userId, sessionId }) => {
    const session = await ChatSession.findOne({ _id: sessionId, userId }).lean();

    if (!session) {
        const error = new Error("Chat session not found");
        error.statusCode = 404;
        throw error;
    }

    const messages = await ChatMessage.find({ userId, sessionId }).sort({ createdAt: 1 }).lean();

    return { session, messages };
};

export const sendChatMessage = async ({ userId, sessionId, message }) => {
    const content = String(message || "").trim();

    if (!content) {
        const error = new Error("Message is required");
        error.statusCode = 400;
        throw error;
    }

    let session = null;

    if (sessionId) {
        session = await ChatSession.findOne({ _id: sessionId, userId });
    }

    if (!session) {
        session = await createChatSession({ userId, title: createSessionTitle(content) });
    }

    await ChatMessage.create({
        userId,
        sessionId: session._id,
        role: "user",
        content,
    });

    const history = await ChatMessage.find({ userId, sessionId: session._id })
        .sort({ createdAt: -1 })
        .limit(8)
        .lean();

    history.reverse();

    const ragResult = await answerWithRag({
        userId,
        question: content,
        history,
    });

    const assistantMessage = await ChatMessage.create({
        userId,
        sessionId: session._id,
        role: "assistant",
        content: ragResult.answer,
        sources: ragResult.sources,
    });

    session.title = session.title === "New chat" ? createSessionTitle(content) : session.title;
    session.lastMessageAt = new Date();
    await session.save();

    return {
        session: session.toObject(),
        message: assistantMessage.toObject(),
        sources: ragResult.sources,
    };
};