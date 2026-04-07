import { createChatSession, getChatMessages, listChatSessions, sendChatMessage } from "../services/chatService.js";

export const createSession = async (req, res) => {
    try {
        const session = await createChatSession({
            userId: req.user.id,
            title: req.body?.title,
        });

        res.status(201).json(session);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

export const listSessions = async (req, res) => {
    try {
        const sessions = await listChatSessions({ userId: req.user.id });
        res.json(sessions);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

export const getSessionMessagesController = async (req, res) => {
    try {
        const result = await getChatMessages({
            userId: req.user.id,
            sessionId: req.params.sessionId,
        });

        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

export const postMessage = async (req, res) => {
    try {
        const result = await sendChatMessage({
            userId: req.user.id,
            sessionId: req.body.sessionId,
            message: req.body.message,
        });

        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
