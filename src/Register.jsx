
import { useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";

export default function Register() {
  const [form, setForm] = useState({
    displayName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setMessage(
      "Form validated. Account creation will be enabled when Django is connected."
    );
  }

  return (
    <main className="login-page">
      <div className="login-glow" />

      <section className="login-container register-container">
        <Link to="/" aria-label="Back to login">
          <img
            className="logo"
            src="/CybersecLogo.png"
            alt="ITP CyberSec"
          />
        </Link>

        <div className="login-heading">
          <span className="eyebrow">NEW OPERATIVE</span>
          <h1>Create account<span>.</span></h1>
          <p>Join the cybersecurity team.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="displayName">DISPLAY NAME</label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              value={form.displayName}
              onChange={updateField}
              maxLength={100}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="username">USERNAME</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Choose a username"
              autoComplete="username"
              value={form.username}
              onChange={updateField}
              minLength={3}
              maxLength={30}
              pattern="[A-Za-z0-9_]+"
              title="Use letters, numbers, and underscores only."
              required
            />
          </div>

          <div className="field">
            <label htmlFor="email">EMAIL ADDRESS</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={form.email}
              onChange={updateField}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">PASSWORD</label>
            <div className="password-field">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                value={form.password}
                onChange={updateField}
                minLength={8}
                required
              />
              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide passwords" : "Show passwords"}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={updateField}
              minLength={8}
              required
            />
          </div>

          <button className="login-button" type="submit">
            Create account <span>→</span>
          </button>

          {message && (
            <p className="message" role="status">{message}</p>
          )}
        </form>

        <div className="signup-prompt">
          Already have an account? <Link to="/">Sign in</Link>
        </div>

        <div className="login-footer">
          <span className="status-dot" />
          ITP CYBERSEC
          <span className="separator">/</span>
          REGISTRATION PORTAL
        </div>
      </section>

      <span className="corner-mark">ITP<span>_</span>SEC</span>
    </main>
  );
}
