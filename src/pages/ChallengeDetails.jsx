import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGame } from "../context/GameContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function ChallengeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { stats, refreshStats } = useGame();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [flag, setFlag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const solvedIds = stats?.solved_challenge_ids || [];
  const isSolved = solvedIds.includes(Number(id));

  useEffect(() => {
    const controller = new AbortController();

    async function fetchChallenge() {
      try {
        setLoading(true);
        setError("");

        const token = sessionStorage.getItem("accessToken");

        const response = await fetch(
          `${API_BASE_URL}/api/challenges/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (response.status === 401) {
          throw new Error("Your session has expired. Please sign in again.");
        }

        if (response.status === 404) {
          throw new Error("Challenge not found or no longer available.");
        }

        if (!response.ok) {
          throw new Error("Could not load challenge details.");
        }

        const data = await response.json();
        setChallenge(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchChallenge();

    return () => controller.abort();
  }, [id]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!flag.trim() || submitting || isSolved) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const token = sessionStorage.getItem("accessToken");

      const response = await fetch(
        `${API_BASE_URL}/api/challenges/${id}/submit/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ flag: flag.trim() }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      if (response.status === 409) {
        setFeedback({
          type: "success",
          message: data.message || "You have already solved this challenge.",
        });

        await refreshStats();
        return;
      }

      if (response.status === 400) {
        const message =
          data.message ||
          data.flag?.[0] ||
          "Incorrect flag. Try again!";

        setFeedback({
          type: "error",
          message,
        });

        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Submission failed. Please try again.");
      }

      setFlag("");

      setFeedback({
        type: "success",
        message: data.message || "Correct flag! Challenge solved.",
        points: data.points_awarded,
      });

      await refreshStats();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Something went wrong.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="detail-state">
        <p>Loading challenge...</p>
      </div>
    );
  }

  if (error) {
    return (
      <section className="detail-state">
        <p className="detail-error">{error}</p>
        <button
          className="detail-back-button"
          onClick={() => navigate("/challenge-list")}
        >
          Back to challenges
        </button>
      </section>
    );
  }

  if (!challenge) return null;

  return (
    <div className="challenge-details">
      <Link to="/challenge-list" className="detail-back-link">
        ← Back to challenges
      </Link>

      <section className="detail-header">
        <span className="minimal-kicker">
          OPERATION FLAGFALL / CHALLENGE {challenge.id}
        </span>

        <div className="detail-title-row">
          <div>
            <div className="detail-tags">
              <span>{challenge.category_display}</span>
              <span>{challenge.difficulty_display}</span>
            </div>

            <h1>{challenge.title}</h1>
          </div>

          <div className="detail-points">
            <strong>{challenge.points}</strong>
            <span>POINTS</span>
          </div>
        </div>
      </section>

      <div className="detail-layout">
        <section className="detail-main-panel">
          <div className="detail-panel-heading">
            <span className="minimal-kicker">MISSION BRIEFING</span>
            <h2>Challenge Description</h2>
          </div>

          <div className="detail-description">
            {challenge.description}
          </div>

          <div className="detail-instructions">
            <span className="minimal-kicker">OBJECTIVE</span>
            <p>
              Investigate the challenge and find the hidden flag.
              Submit the correct flag below to earn your points.
            </p>

            <p className="detail-flag-format">
              FLAG FORMAT: <code>FLAG&#123;...&#125;</code>
            </p>
          </div>
        </section>

        <aside className="detail-submit-panel">
          <div className="detail-panel-heading">
            <span className="minimal-kicker">FLAG SUBMISSION</span>
            <h2>Submit your flag</h2>
          </div>

          {isSolved ? (
            <div className="detail-solved">
              <span className="detail-status-icon">✓</span>
              <h3>Challenge Solved</h3>
              <p>You have already captured this flag.</p>
              <strong>{challenge.points} POINTS EARNED</strong>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="detail-submit-form">
              <label htmlFor="flag-input">YOUR FLAG</label>

              <input
                id="flag-input"
                type="text"
                value={flag}
                onChange={(event) => setFlag(event.target.value)}
                placeholder="FLAG{your_answer_here}"
                autoComplete="off"
                spellCheck="false"
                maxLength={255}
                required
              />

              <button
                type="submit"
                disabled={!flag.trim() || submitting}
              >
                {submitting ? "VERIFYING..." : "SUBMIT FLAG →"}
              </button>
            </form>
          )}

          {feedback && (
            <div
              className={`detail-feedback ${feedback.type}`}
              role="status"
              aria-live="polite"
            >
              <strong>
                {feedback.type === "success" ? "SUCCESS" : "SUBMISSION FAILED"}
              </strong>

              <p>{feedback.message}</p>

              {feedback.points !== undefined && (
                <span>+{feedback.points} POINTS AWARDED</span>
              )}
            </div>
          )}

          <div className="detail-submit-note">
            <span>!</span>
            Flags are case-sensitive. Make sure your submission is exact.
          </div>
        </aside>
      </div>
    </div>
  );
}