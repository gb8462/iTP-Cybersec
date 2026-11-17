
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useGame } from "../context/GameContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ChallengeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { stats, refreshStats } = useGame();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [attachments, setAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(true);
  const [attachmentsError, setAttachmentsError] = useState("");

  const [links, setLinks] = useState([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [linksError, setLinksError] = useState("");

  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState("");

  const [flag, setFlag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const solvedIds = stats?.solved_challenge_ids || [];
  const isSolved = solvedIds.includes(Number(id));

  useEffect(() => {
    const controller = new AbortController();
    
    // Reset challenge-specific resources when the challenge changes.
    setAttachments([]);
    setAttachmentsLoading(true);
    setAttachmentsError("");

    setLinks([]);
    setLinksLoading(true);
    setLinksError("");

    setDownloadingId(null);
    setDownloadError("");

    async function loadCollection(path, setData, setError, setLoading) {
      try {
        const token = sessionStorage.getItem("accessToken");

        const response = await fetch(`${API_BASE_URL}${path}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (response.status === 401) {
          throw new Error("Your session has expired. Please sign in again.");
        }

        if (!response.ok) {
          throw new Error("Could not load this section.");
        }

        const data = await response.json();
        setData(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

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

        if (controller.signal.aborted) return;

        setChallenge(data);

        // Load attachments and resource links independently.
        loadCollection(
          `/api/challenges/${id}/attachments/`,
          setAttachments,
          setAttachmentsError,
          setAttachmentsLoading
        );

        loadCollection(
          `/api/challenges/${id}/links/`,
          setLinks,
          setLinksError,
          setLinksLoading
        );
      } catch (err) {
        if (!controller.signal.aborted) {
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

  async function handleDownload(attachment) {
    if (downloadingId !== null) return;

    setDownloadingId(attachment.id);
    setDownloadError("");

    try {
      const token = sessionStorage.getItem("accessToken");

      const response = await fetch(
        `${API_BASE_URL}/api/challenges/${id}/attachments/${attachment.id}/download/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      if (!response.ok) {
        throw new Error(
          data.detail || "Could not generate the download link."
        );
      }

      if (!data.download_url) {
        throw new Error("The server did not return a download URL.");
      }

      // Django provides a short-lived Supabase signed URL.
      window.location.assign(data.download_url);
    } catch (err) {
      setDownloadError(err.message || "Download failed.");
    } finally {
      setDownloadingId(null);
    }
  }

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
          {/* Challenge description */}
          <div className="detail-panel-heading">
            <span className="minimal-kicker">MISSION BRIEFING</span>
            <h2>Challenge Description</h2>
          </div>

          <div className="detail-description">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {challenge.description || ""}
            </ReactMarkdown>
          </div>

          {/* Challenge attachments */}
          <section className="detail-resources">
            <div className="detail-panel-heading">
              <span className="minimal-kicker">MISSION FILES</span>
              <h2>Challenge Attachments</h2>
            </div>

            {attachmentsLoading ? (
              <p className="detail-resource-message">
                Loading attachments...
              </p>
            ) : attachmentsError ? (
              <p className="detail-resource-error" role="alert">
                {attachmentsError}
              </p>
            ) : attachments.length === 0 ? (
              <p className="detail-resource-message">
                No attachments are available for this challenge.
              </p>
            ) : (
              <div className="detail-attachment-list">
                {attachments.map((attachment) => (
                  <div
                    className="detail-attachment"
                    key={attachment.id}
                  >
                    <div className="detail-attachment-info">
                      <span className="detail-file-icon">FILE</span>

                      <div>
                        <strong>{attachment.file_name}</strong>
                        <span>
                          {formatFileSize(attachment.file_size)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="detail-download-button"
                      onClick={() => handleDownload(attachment)}
                      disabled={downloadingId !== null}
                    >
                      {downloadingId === attachment.id
                        ? "PREPARING..."
                        : "DOWNLOAD ↓"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {downloadError && (
              <p className="detail-resource-error" role="alert">
                {downloadError}
              </p>
            )}
          </section>

          {/* External resource links */}
          <section className="detail-resources">
            <div className="detail-panel-heading">
              <span className="minimal-kicker">INTELLIGENCE SOURCES</span>
              <h2>External Resources</h2>
            </div>

            {linksLoading ? (
              <p className="detail-resource-message">
                Loading resources...
              </p>
            ) : linksError ? (
              <p className="detail-resource-error" role="alert">
                {linksError}
              </p>
            ) : links.length === 0 ? (
              <p className="detail-resource-message">
                No external resources are available for this challenge.
              </p>
            ) : (
              <div className="detail-resource-list">
                {links.map((resource) => (
                  <a
                    className="detail-resource-link"
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={resource.id}
                  >
                    <div>
                      <strong>{resource.title}</strong>

                      {resource.description && (
                        <p>{resource.description}</p>
                      )}
                    </div>

                    <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Objective */}
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

        {/* Flag submission */}
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
                {feedback.type === "success"
                  ? "SUCCESS"
                  : "SUBMISSION FAILED"}
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
