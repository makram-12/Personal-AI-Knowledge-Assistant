import { useState } from "react";
import Home from "./pages/Home";
import Ask from "./pages/Ask";
import Search from "./pages/Search";
import Summarize from "./pages/Summarize";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <div className="container">
      <nav className="nav">
        <h2>AI Assistant</h2>

        <div className="nav-links">
          <button onClick={() => setPage("home")}>Knowledge</button>
          <button onClick={() => setPage("ask")}>Ask AI</button>
          <button onClick={() => setPage("search")}>Search</button>
          <button onClick={() => setPage("summarize")}>Summarize</button>
        </div>
      </nav>

      <div className="content">
        {page === "home" && <Home />}
        {page === "ask" && <Ask />}
        {page === "search" && <Search />}
        {page === "summarize" && <Summarize />}
      </div>
    </div>
  );
}