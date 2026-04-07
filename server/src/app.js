import express from "express";
import cors from "cors";
import knowledgeRoutes from "./routes/knowledgeRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "AI Assistant API Running 🚀" });
});

app.use("/api/knowledge", knowledgeRoutes);

export default app;