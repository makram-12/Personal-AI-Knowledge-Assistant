import { useState, useEffect } from "react";
import API from "../api/api";

export default function Home() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [data, setData] = useState([]);

    const fetchData = async () => {
        const res = await API.get("/knowledge");
        setData(res.data);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, []);

    const addKnowledge = async () => {
        await API.post("/knowledge", { title, content });
        setTitle("");
        setContent("");
        fetchData();
    };

    return (
        <div>
            <h2 className="title">Knowledge Base</h2>

            <div className="form">
                <input
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                    placeholder="Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />

                <button onClick={addKnowledge}>Add</button>
            </div>

            <div className="grid">
                {data.map((item) => (
                    <div className="card" key={item._id}>
                        <h3>{item.title}</h3>
                        <p>{item.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}