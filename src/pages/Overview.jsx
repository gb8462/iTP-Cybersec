
import { Link } from "react-router-dom";
import { useGame } from "../context/GameContext";

const categories = [
  { name: "Web Exploitation", code: "WEB", color: "orange" },
  { name: "Cryptography", code: "CRYPTO", color: "purple" },
  { name: "Digital Forensics", code: "FORENSICS", color: "blue" },
  { name: "Miscellaneous", code: "MISC", color: "green" },
];

export default function Overview() {
  const { user, challenges, stats, loading, error } = useGame();

  const displayName = user.display_name || user.username;
  const solvedIds = stats?.solved_challenge_ids || [];

  return (
    <>
      <section className="minimal-welcome">
        <span className="minimal-kicker">
          ITP CYBERSEC / OPERATION FLAGFALL
        </span>

        <h1>
          Ready when you are, <span>{displayName}</span>.
        </h1>

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
            {loading ? "..." : stats?.total_points ?? 0}
            <small> pts</small>
          </strong>
        </div>

        <div>
          <span>CHALLENGES SOLVED</span>
          <strong>
            {loading ? "..." : stats?.challenges_solved ?? 0}
            <small> / {stats?.total_active_challenges ?? 0}</small>
          </strong>
        </div>

        <div>
          <span>RANK</span>
          <strong>—</strong>
        </div>
      </section>

      <section className="minimal-section">
        <div className="minimal-section-heading">
          <div>
            <span className="minimal-kicker">PICK YOUR DOMAIN</span>
            <h2>Challenge Categories</h2>
          </div>

          <Link to="/challenges" className="muted-count">
            VIEW ALL ↗
          </Link>
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
              <Link
                to={`/challenge-list?category=${category.code}`}
                className="minimal-category"
                key={category.code}
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
                  <span>
                    {loading ? "..." : `${solvedCount} / ${categoryChallenges.length} solved`}
                  </span>

                  <span>
                    {loading
                      ? "Loading"
                      : `${categoryChallenges.length} available`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="minimal-section">
        <div className="minimal-section-heading">
          <div>
            <span className="minimal-kicker">CONTINUE YOUR PROGRESS</span>
            <h2>Recent Challenges</h2>
          </div>

          <Link to="/challenge-list" className="muted-count">
            VIEW ALL ↗
          </Link>
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
            {challenges.slice(0, 3).map((challenge) => {
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
    </>
  );
}
