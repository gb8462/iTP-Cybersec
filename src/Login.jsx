
import { useState } from "react";
import "./App.css";

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setMessage("Authentication will be available when the backend is connected.");
  }

  return (
    <main className="login-page">
      <div className="login-glow" />

      <section className="login-container">
        <img
          className="logo"
          src="/CybersecLogo.png"
          alt="ITP CyberSec"
        />

        <div className="login-heading">
          <span className="eyebrow">SECURE ACCESS</span>
          <h1>Sign in<span>.</span></h1>
          <p>Access your operations dashboard.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">USERNAME OR EMAIL</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">PASSWORD</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          <button className="login-button" type="submit">
            Sign in <span>→</span>
          </button>

          {message && (
            <p className="message" role="status">{message}</p>
          )}

          <div className="signup-prompt">
            Don't have an account?{" "}
            <a href="/register">Sign up</a>
          </div>
                  
        </form>

        <div className="login-footer">
          <span className="status-dot" />
          ITP CYBERSEC
          <span className="separator">/</span>
          AUTHENTICATION PORTAL
        </div>
      </section>

      <span className="corner-mark">ITP<span>_</span>SEC</span>
    </main>
  );
}
