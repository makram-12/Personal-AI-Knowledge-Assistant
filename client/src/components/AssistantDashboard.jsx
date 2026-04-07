import { useEffect, useMemo, useState } from "react";
import API from "../api/api";

const emptyKnowledgeForm = {
    title: "",
    content: "",
    tags: "",
};

export default function AssistantDashboard({ user, onLogout }) {
    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState("");
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [knowledgeForm, setKnowledgeForm] = useState(emptyKnowledgeForm);
    const [ingesting, setIngesting] = useState(false);
    const [status, setStatus] = useState("");

    const activeSession = useMemo(
        () => sessions.find((session) => session._id === activeSessionId),
        [sessions, activeSessionId]
    );

    const loadSessions = async () => {
        const response = await API.get("/chat/sessions");
        setSessions(response.data);

        if (!activeSessionId && response.data.length > 0) {
            setActiveSessionId(response.data[0]._id);
        }
    };

    const loadDocuments = async () => {
        const response = await API.get("/knowledge");
        setDocuments(response.data.items || []);
    };

    const loadMessages = async (sessionId) => {
        if (!sessionId) {
            setMessages([]);
            return;
        }

        const response = await API.get(`/chat/sessions/${sessionId}/messages`);
        setMessages(response.data.messages || []);
    };

    useEffect(() => {
        loadSessions().catch(() => setStatus("Failed to load chat sessions"));
        loadDocuments().catch(() => setStatus("Failed to load knowledge documents"));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadMessages(activeSessionId).catch(() => setStatus("Failed to load messages"));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSessionId]);

    const startNewChat = async () => {
        const response = await API.post("/chat/sessions", { title: "New chat" });
        setSessions((current) => [response.data, ...current]);
        setActiveSessionId(response.data._id);
    };

    const sendMessage = async (event) => {
        event.preventDefault();

        if (!message.trim()) {
            return;
        }

        try {
            setSending(true);
            setStatus("");

            const response = await API.post("/chat/message", {
                sessionId: activeSessionId,
                message,
            });

            setMessage("");
            setActiveSessionId(response.data.session._id);

            const refreshedMessages = await API.get(
                `/chat/sessions/${response.data.session._id}/messages`
            );

            setMessages(refreshedMessages.data.messages || []);
            await loadSessions();
        } catch (error) {
            setStatus(error?.response?.data?.message || "Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const handleKnowledgeChange = (event) => {
        const { name, value } = event.target;
        setKnowledgeForm((current) => ({ ...current, [name]: value }));
    };

    const ingestKnowledge = async (event) => {
        event.preventDefault();

        try {
            setIngesting(true);
            setStatus("");

            await API.post("/knowledge/ingest", {
                title: knowledgeForm.title,
                content: knowledgeForm.content,
                tags: knowledgeForm.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                sourceType: "text",
            });

            setKnowledgeForm(emptyKnowledgeForm);
            await loadDocuments();
            setStatus("Knowledge ingested successfully");
        } catch (error) {
            setStatus(error?.response?.data?.message || "Failed to ingest knowledge");
        } finally {
            setIngesting(false);
        }
    };

    return (
        <main className="workspace-shell">
            <aside className="sidebar">
                <div>
                    <p className="eyebrow">Welcome back</p>
                    <h2>{user.name}</h2>
                    <p className="sidebar-copy">Secure knowledge workspace with retrieval-aware chat.</p>
                </div>

                <button className="secondary-button" type="button" onClick={startNewChat}>
                    + New chat
                </button>

                <div className="sidebar-section">
                    <h3>Chat sessions</h3>
                    <div className="session-list">
                        {sessions.length === 0 && <p className="muted">No chats yet.</p>}
                        {sessions.map((session) => (
                            <button
                                key={session._id}
                                type="button"
                                className={session._id === activeSessionId ? "session-item active" : "session-item"}
                                onClick={() => setActiveSessionId(session._id)}
                            >
                                <span>{session.title}</span>
                                <small>{new Date(session.lastMessageAt).toLocaleDateString()}</small>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="sidebar-footer">
                    <button className="secondary-button" type="button" onClick={onLogout}>
                        Logout
                    </button>
                </div>
            </aside>

            <section className="main-panel">
                <header className="panel-header">
                    <div>
                        <p className="eyebrow">RAG chat</p>
                        <h1>{activeSession?.title || "Start a new conversation"}</h1>
                    </div>
                    <p className="panel-subtitle">
                        The assistant only sees relevant chunks from your own knowledge base.
                    </p>
                </header>

                <div className="chat-card">
                    <div className="messages">
                        {messages.length === 0 ? (
                            <div className="empty-state">
                                <h3>No messages yet</h3>
                                <p>Ask a question after adding knowledge to get grounded answers.</p>
                            </div>
                        ) : (
                            messages.map((item) => (
                                <div key={item._id} className={item.role === "user" ? "bubble user" : "bubble assistant"}>
                                    <span className="bubble-role">{item.role}</span>
                                    <p>{item.content}</p>
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={sendMessage} className="composer">
                        <textarea
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder="Ask anything about your uploaded knowledge..."
                            rows={4}
                        />
                        <div className="composer-actions">
                            <span className="muted">Top-k retrieval and context truncation are handled on the server.</span>
                            <button type="submit" disabled={sending}>
                                {sending ? "Thinking..." : "Send"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            <aside className="right-rail">
                <div className="panel-card">
                    <div className="panel-card-header">
                        <div>
                            <p className="eyebrow">Ingest knowledge</p>
                            <h3>Add text or long notes</h3>
                        </div>
                    </div>

                    <form onSubmit={ingestKnowledge} className="knowledge-form">
                        <input
                            name="title"
                            value={knowledgeForm.title}
                            onChange={handleKnowledgeChange}
                            placeholder="Title"
                        />
                        <textarea
                            name="content"
                            value={knowledgeForm.content}
                            onChange={handleKnowledgeChange}
                            placeholder="Paste long documents here..."
                            rows={10}
                        />
                        <input
                            name="tags"
                            value={knowledgeForm.tags}
                            onChange={handleKnowledgeChange}
                            placeholder="Tags, comma separated"
                        />
                        <button type="submit" disabled={ingesting}>
                            {ingesting ? "Saving..." : "Ingest"}
                        </button>
                    </form>
                </div>

                <div className="panel-card">
                    <p className="eyebrow">Knowledge base</p>
                    <h3>{documents.length} documents</h3>
                    <div className="document-list">
                        {documents.slice(0, 5).map((document) => (
                            <div key={document._id} className="document-item">
                                <strong>{document.title}</strong>
                                <span>
                                    {document.chunkCount} chunks · {new Date(document.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                        {documents.length === 0 && <p className="muted">No documents ingested yet.</p>}
                    </div>
                </div>

                {status && (
                    <div className="panel-card status-card">
                        <p>{status}</p>
                    </div>
                )}
            </aside>
        </main>
    );
}