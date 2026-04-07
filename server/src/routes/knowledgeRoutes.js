import express from "express";
import {
    createKnowledge,
    getKnowledge,
    askKnowledge,
    summarizeKnowledge,
    searchKnowledge,
} from "../controllers/knowledgeController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", createKnowledge);
router.get("/", getKnowledge);
router.post("/ask", askKnowledge);
router.post("/summarize", summarizeKnowledge);
router.post("/search", searchKnowledge);

router.post("/ingest", createKnowledge);

export default router;