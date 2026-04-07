import { useEffect, useState } from "react";
import API from "./api/api";
import AuthPanel from "./components/AuthPanel";
import AssistantDashboard from "./components/AssistantDashboard";
import "./App.css";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("paika_token") || "");
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    let isMounted = true;

    const fetchMe = async () => {
      try {
        const response = await API.get("/auth/me");

        if (isMounted) {
          setUser(response.data.user);
        }
      } catch (error) {
        localStorage.removeItem("paika_token");

        if (isMounted) {
          setToken("");
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoadingUser(false);
        }
      }
    };

    fetchMe();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleAuthSuccess = ({ token: newToken, user: newUser }) => {
    localStorage.setItem("paika_token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("paika_token");
    setToken("");
    setUser(null);
  };

  if (loadingUser) {
    return <div className="app-shell loading-shell">Loading workspace...</div>;
  }

  if (!token || !user) {
    return <AuthPanel onAuthSuccess={handleAuthSuccess} />;
  }

  return <AssistantDashboard user={user} onLogout={handleLogout} />;
}