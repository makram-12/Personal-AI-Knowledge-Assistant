import express from "express";
import {
    createKnowledge,
    getKnowledge,
    askKnowledge,
    summarizeKnowledge,
    searchKnowledge,
} from "../controllers/knowledgeController.js";

const router = express.Router();

router.post("/", createKnowledge);
router.get("/", getKnowledge);
router.post("/ask", askKnowledge);
router.post("/summarize", summarizeKnowledge);
router.post("/search", searchKnowledge);

export default router;