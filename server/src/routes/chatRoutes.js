import express from "express";
import {
    createSession,
    getSessionMessagesController,
    listSessions,
    postMessage,
} from "../controllers/chatController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/sessions", listSessions);
router.post("/sessions", createSession);
router.get("/sessions/:sessionId/messages", getSessionMessagesController);
router.post("/message", postMessage);

export default router;