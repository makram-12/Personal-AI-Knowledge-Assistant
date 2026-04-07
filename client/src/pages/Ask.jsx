import { useState } from "react";
import API from "../api/api";

export default function Ask() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");

    const ask = async () => {
        const res = await API.post("/knowledge/ask", { question });
        setAnswer(res.data.answer);
    };

    return (
        <div>
            <h2 className="title">Ask AI</h2>

            <div className="chat-box">
                <input
                    placeholder="Ask something..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                />

                <button onClick={ask}>Send</button>
            </div>

            {answer && (
                <div className="answer">
                    <h3>Answer:</h3>
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
}