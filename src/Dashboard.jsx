
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

const categories = [
  { name: "Web Exploitation", code: "WEB", color: "orange" },
  { name: "Cryptography", code: "CRYPTO", color: "purple" },
  { name: "Digital Forensics", code: "FORENSICS", color: "blue" },
  { name: "Miscellaneous", code: "MISC", color: "green" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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
    }
  }, [navigate]);

  function handleLogout() {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("currentUser");
    navigate("/", { replace: true });
  }

  if (!user) return null;

  const displayName = user.display_name || user.username;

  return (
    <main className="minimal-dashboard">
      <header className="minimal-header">
        <Link to="/dashboard" className="minimal-brand">
          <img src="/CybersecLogo.png" alt="ITP CyberSec" />
        </Link>

        <nav className="minimal-nav">
          <a className="selected" href="#overview">Overview</a>
          <a href="#categories">Challenges</a>
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
          <span className="minimal-kicker">ITP CYBERSEC / OPERATION FLAGFALL</span>
          <h1>Ready when you are, <span>{displayName}</span>.</h1>
          <p>Find the vulnerabilities. Solve the puzzles. Capture the flags.</p>
        </section>

        <section className="minimal-stats" aria-label="Player statistics">
          <div>
            <span>POINTS</span>
            <strong>0 <small>pts</small></strong>
          </div>
          <div>
            <span>CHALLENGES SOLVED</span>
            <strong>0 <small>/ 20</small></strong>
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
            <span className="muted-count">04 CATEGORIES</span>
          </div>

          <div className="minimal-categories">
            {categories.map((category, index) => (
              <article
                className="minimal-category"
                key={category.name}
              >
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
                  <span>0 / 5 solved</span>
                  <span>Coming soon</span>
                </div>
              </article>
            ))}
          </div>
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
            <p>No rankings yet. Be the first to put points on the board.</p>
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
