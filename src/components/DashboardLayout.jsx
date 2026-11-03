
import { NavLink, Outlet } from "react-router-dom";
import { GameProvider, useGame } from "../context/GameContext";

function DashboardShell() {
  const { user, logout } = useGame();

  const displayName = user.display_name || user.username;

  return (
    <main className="minimal-dashboard">
      <header className="minimal-header">
        <NavLink to="/dashboard" className="minimal-brand">
          <img src="/CybersecLogo.png" alt="ITP CyberSec" />
        </NavLink>

        <nav className="minimal-nav">
          <NavLink to="/dashboard">Overview</NavLink>
          <NavLink to="/challenges">Challenges</NavLink>
          <NavLink to="/challenge-list">Challenge List</NavLink>
          <NavLink to="/leaderboard">Leaderboard</NavLink>
        </nav>

        <div className="minimal-profile">
          <span className="profile-initial">
            {displayName.charAt(0).toUpperCase()}
          </span>

          <span className="profile-name">{displayName}</span>

          <button onClick={logout} className="minimal-logout">
            Sign out
          </button>
        </div>
      </header>

      <div className="minimal-content">
        <Outlet />

        <footer className="minimal-footer">
          <span>iTP-CYBERSEC</span>
          <span>THINK SHARP. CAPTURE FLAGS.</span>
        </footer>
      </div>
    </main>
  );
}

export default function DashboardLayout() {
  return (
    <GameProvider>
      <DashboardShell />
    </GameProvider>
  );
}
