import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: username.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const detail =
          data.detail ||
          data.non_field_errors?.[0] ||
          data.identifier?.[0] ||
          data.password?.[0] ||
          "Login failed. Check your credentials.";
        throw new Error(detail);
      }

      // Temporary client-side session storage for this prototype.
      sessionStorage.setItem("accessToken", data.access);
      sessionStorage.setItem("refreshToken", data.refresh);
      sessionStorage.setItem("currentUser", JSON.stringify(data.user));

      navigate("/dashboard", { replace: true });

      // We'll redirect to the dashboard once its route is ready.
    } catch (error) {
      setMessage(
        error instanceof TypeError
          ? "Cannot connect to the server. Make sure Django is running."
          : error.message
      );
    } finally {
      setLoading(false);
    }
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
              placeholder="Enter your username or email"
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

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"} <span>→</span>
          </button>

          {message && (
            <p className="message" role="status">
              {message}
            </p>
          )}

          <div className="signup-prompt">
            Don't have an account?{" "}
            <Link to="/register">Sign up</Link>
          </div>
        </form>

        <div className="login-footer">
          <span className="status-dot" /> ITP CYBERSEC
          <span className="separator">/</span> AUTHENTICATION PORTAL
        </div>
      </section>

      <span className="corner-mark">ITP<span>_</span>SEC</span>
    </main>
  );
}
