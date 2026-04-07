import { useState } from "react";
import API from "../api/api";

const initialForm = {
    name: "",
    email: "",
    password: "",
};

export default function AuthPanel({ onAuthSuccess }) {
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const submit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const payload =
                mode === "register"
                    ? form
                    : {
                        email: form.email,
                        password: form.password,
                    };

            const response = await API.post(`/auth/${mode}`, payload);
            onAuthSuccess(response.data);
        } catch (err) {
            setError(err?.response?.data?.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-screen">
            <div className="auth-card">
                <div className="auth-hero">
                    <div>
                        <p className="eyebrow">Personal AI Knowledge Assistant</p>
                        <h1>Private RAG workspace for your notes and chats.</h1>
                        <p>
                            Sign in to isolate your data, ingest documents, and ask questions over only
                            the knowledge you own.
                        </p>
                    </div>
                </div>

                <div className="auth-panel">
                    <div className="auth-tabs">
                        <button
                            className={mode === "login" ? "tab active" : "tab"}
                            onClick={() => setMode("login")}
                            type="button"
                        >
                            Login
                        </button>
                        <button
                            className={mode === "register" ? "tab active" : "tab"}
                            onClick={() => setMode("register")}
                            type="button"
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={submit} className="auth-form">
                        {mode === "register" && (
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Name"
                                autoComplete="name"
                            />
                        )}
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Email"
                            autoComplete="email"
                        />
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Password"
                            autoComplete={mode === "register" ? "new-password" : "current-password"}
                        />

                        {error && <p className="form-error">{error}</p>}

                        <button type="submit" disabled={loading}>
                            {loading ? "Working..." : mode === "register" ? "Create account" : "Login"}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}