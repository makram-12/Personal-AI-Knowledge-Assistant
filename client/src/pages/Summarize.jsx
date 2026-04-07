import { useState } from "react";
import API from "../api/api";

export default function Summarize() {
    const [content, setContent] = useState("");
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSummarize = async () => {
        if (!content) return;

        try {
            setLoading(true);

            const res = await API.post("/knowledge/summarize", {
                content,
            });

            setSummary(res.data.summary);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="title">Summarize Text</h2>

            <textarea
                placeholder="Paste your long text here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ minHeight: "150px" }}
            />

            <button onClick={handleSummarize}>
                {loading ? "Summarizing..." : "Summarize"}
            </button>

            {summary && (
                <div className="answer">
                    <h3>Summary:</h3>
                    <p>{summary}</p>
                </div>
            )}
        </div>
    );
}