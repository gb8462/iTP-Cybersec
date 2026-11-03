import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const categories = [
  { name: "Web Exploitation", code: "WEB", color: "orange" },
  { name: "Cryptography", code: "CRYPTO", color: "purple" },
  { name: "Digital Forensics", code: "FORENSICS", color: "blue" },
  { name: "Miscellaneous", code: "MISC", color: "green" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      handleLogout();
      return;
    }

    async function loadDashboard() {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [challengeResponse, statsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/challenges/`, { headers }),
          fetch(`${API_BASE_URL}/api/challenges/stats/`, { headers }),
        ]);

        if (challengeResponse.status === 401 || statsResponse.status === 401) {
          throw new Error("Your session has expired. Please sign in again.");
        }

        if (!challengeResponse.ok || !statsResponse.ok) {
          throw new Error("Could not load dashboard data from the server.");
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

    loadDashboard();
  }, [navigate]);

  function handleLogout() {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("currentUser");
    navigate("/", { replace: true });
  }

  if (!user) return null;

  const displayName = user.display_name || user.username;
  const solvedIds = stats?.solved_challenge_ids || [];

  return (
    <main className="minimal-dashboard">
      <header className="minimal-header">
        <Link to="/dashboard" className="minimal-brand">
          <img src="/CybersecLogo.png" alt="ITP CyberSec" />
        </Link>

        <nav className="minimal-nav">
          <a className="selected" href="#overview">Overview</a>
          <a href="#categories">Challenges</a>
          <a href="#challenge-list">Challenge List</a>
          <a href="#leaderboard">Leaderboard</a>
        </nav>

        <div className="minimal-profile">
          <span className="profile-initial">
            {displayName.charAt(0).toUpperCase()}
          </span>
          <span className="profile-name">{displayName}</span>
          <button onClick={handleLogout} className="minimal-logout">
            Sign out
          </button>
        </div>
      </header>

      <div className="minimal-content">
        <section id="overview" className="minimal-welcome">
          <span className="minimal-kicker">
            ITP CYBERSEC / OPERATION FLAGFALL
          </span>
          <h1>Ready when you are, <span>{displayName}</span>.</h1>
          <p>Find the vulnerabilities. Solve the puzzles. Capture the flags.</p>
        </section>

        {error && (
          <p className="dashboard-message" role="alert">
            {error}
          </p>
        )}

        <section className="minimal-stats" aria-label="Player statistics">
          <div>
            <span>POINTS</span>
            <strong>
              {loading ? "..." : (stats?.total_points ?? 0)}
              <small> pts</small>
            </strong>
          </div>

          <div>
            <span>CHALLENGES SOLVED</span>
            <strong>
              {loading ? "..." : (stats?.challenges_solved ?? 0)}
              <small> / {stats?.total_active_challenges ?? 0}</small>
            </strong>
          </div>

          <div>
            <span>RANK</span>
            <strong>—</strong>
          </div>
        </section>

        <section id="categories" className="minimal-section">
          <div className="minimal-section-heading">
            <div>
              <span className="minimal-kicker">PICK YOUR DOMAIN</span>
              <h2>Challenges</h2>
            </div>
            <span className="muted-count">
              {loading ? "LOADING..." : `${categories.length} CATEGORIES`}
            </span>
          </div>

          <div className="minimal-categories">
            {categories.map((category, index) => {
              const categoryChallenges = challenges.filter(
                (challenge) => challenge.category === category.code
              );

              const solvedCount = categoryChallenges.filter(
                (challenge) => solvedIds.includes(challenge.id)
              ).length;

              return (
                <article className="minimal-category" key={category.code}>
                  <div className={`minimal-category-code ${category.color}`}>
                    {category.code}
                  </div>

                  <div className="minimal-category-info">
                    <span className="category-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3>{category.name}</h3>
                  </div>

                  <span className="category-arrow">↗</span>

                  <div className="minimal-category-bottom">
                    <span>
                      {loading ? "..." : `${solvedCount} / ${categoryChallenges.length} solved`}
                    </span>
                    <span>
                      {loading
                        ? "Loading"
                        : categoryChallenges.length
                          ? `${categoryChallenges.length} available`
                          : "No challenges yet"}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="challenge-list" className="minimal-section">
          <div className="minimal-section-heading">
            <div>
              <span className="minimal-kicker">TEST YOUR SKILLS</span>
              <h2>Available Challenges</h2>
            </div>
            <span className="muted-count">
              {loading ? "..." : `${challenges.length} CHALLENGES`}
            </span>
          </div>

          {loading ? (
            <div className="minimal-empty">
              <p>Loading challenges...</p>
            </div>
          ) : challenges.length === 0 ? (
            <div className="minimal-empty">
              <span>—</span>
              <p>No active challenges have been published yet.</p>
            </div>
          ) : (
            <div className="challenge-grid">
              {challenges.map((challenge) => {
                const solved = solvedIds.includes(challenge.id);

                return (
                  <article className="challenge-card" key={challenge.id}>
                    <div className="challenge-card-top">
                      <span>{challenge.category_display}</span>
                      <span className={solved ? "challenge-solved" : ""}>
                        {solved ? "SOLVED" : challenge.difficulty_display}
                      </span>
                    </div>

                    <h3>{challenge.title}</h3>
                    <p>{challenge.description}</p>

                    <div className="challenge-card-bottom">
                      <span>{challenge.points} PTS</span>
                      <span>{solved ? "✓ Completed" : "Not solved"}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section id="leaderboard" className="minimal-section minimal-leaderboard">
          <div className="minimal-section-heading">
            <div>
              <span className="minimal-kicker">WHO'S LEADING?</span>
              <h2>Leaderboard</h2>
            </div>
            <span className="muted-count">TOP PLAYERS</span>
          </div>

          <div className="minimal-empty">
            <span>—</span>
            <p>Leaderboard integration is coming next.</p>
          </div>
        </section>

        <footer className="minimal-footer">
          <span>iTP-CYBERSEC</span>
          <span>THINK SHARP. CAPTURE FLAGS.</span>
        </footer>
      </div>
    </main>
  );
}