import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refreshStats() {
    const token = sessionStorage.getItem("accessToken");

    if (!token) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/challenges/stats/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Could not refresh player statistics.");
    }

    const data = await response.json();
    setStats(data);

    return data;
  }

  function logout() {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("currentUser");

    setUser(null);
    navigate("/", { replace: true });
  }

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    const savedUser = sessionStorage.getItem("currentUser");

    if (!token || !savedUser) {
      navigate("/", { replace: true });
      return;
    }

    try {
      setUser(JSON.parse(savedUser));
    } catch {
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("currentUser");
      navigate("/", { replace: true });
      return;
    }

    async function loadGameData() {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [challengeResponse, statsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/challenges/`, { headers }),
          fetch(`${API_BASE_URL}/api/challenges/stats/`, { headers }),
        ]);

        if (
          challengeResponse.status === 401 ||
          statsResponse.status === 401
        ) {
          throw new Error("Your session has expired. Please sign in again.");
        }

        if (!challengeResponse.ok || !statsResponse.ok) {
          throw new Error("Could not load game data from the server.");
        }

        const challengeData = await challengeResponse.json();
        const statsData = await statsResponse.json();

        setChallenges(challengeData);
        setStats(statsData);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadGameData();
  }, [navigate]);

  const value = {
    user,
    challenges,
    stats,
    loading,
    error,
    logout,
    refreshStats,
  };

  if (!user) return null;

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame must be used inside GameProvider.");
  }

  return context;
}