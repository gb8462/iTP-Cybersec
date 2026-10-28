
import { useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

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
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          display_name: form.displayName.trim(),
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          confirm_password: form.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const fieldNames = {
          display_name: "Display name",
          username: "Username",
          email: "Email",
          password: "Password",
          confirm_password: "Confirm password",
          non_field_errors: "Error",
          detail: "Error",
        };

        const errors = Object.entries(data)
          .map(([field, messages]) => {
            const text = Array.isArray(messages)
              ? messages.join(" ")
              : String(messages);

            return `${fieldNames[field] || field}: ${text}`;
          })
          .join(" ");

        setMessage(errors || "Registration failed. Please try again.");
        return;
      }

      setMessage(
        `Account created successfully, ${data.username}! You can now sign in.`
      );

      setForm({
        displayName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch {
      setMessage(
        "Could not connect to the server. Make sure Django is running."
      );
    } finally {
      setLoading(false);
    }
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
          <h1>
            Create account<span>.</span>
          </h1>
          <p>Join the cybersecurity team.</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
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

          <div className="field register-email-field">
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

          <button
            className="login-button register-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
            {!loading && <span> →</span>}
          </button>

          {message && (
            <p className="message" role="status" aria-live="polite">
              {message}
            </p>
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

      <span className="corner-mark">
        ITP<span>_</span>SEC
      </span>
    </main>
  );
}
