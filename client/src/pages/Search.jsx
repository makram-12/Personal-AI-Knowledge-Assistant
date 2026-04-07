import { useState } from "react";
import API from "../api/api";

export default function Search() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    const search = async () => {
        const res = await API.post("/knowledge/search", { query });
        setResults(res.data);
    };

    return (
        <div>
            <h2 className="title">Search Knowledge</h2>

            <div className="chat-box">
                <input
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />

                <button onClick={search}>Search</button>
            </div>

            <div className="grid">
                {results.map((item) => (
                    <div className="card" key={item._id}>
                        <h3>{item.title}</h3>
                        <p>{item.content}</p>
                        <small>Score: {item.score?.toFixed(2)}</small>
                    </div>
                ))}
            </div>
        </div>
    );
}