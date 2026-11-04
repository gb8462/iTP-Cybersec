import { Link, useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useGame } from "../context/GameContext";

const categories = [
  { name: "All Categories", code: "ALL" },
  { name: "Web Exploitation", code: "WEB" },
  { name: "Cryptography", code: "CRYPTO" },
  { name: "Digital Forensics", code: "FORENSICS" },
  { name: "Miscellaneous", code: "MISC" },
];

const difficulties = ["ALL", "EASY", "MEDIUM", "HARD"];

export default function ChallengeList() {
  const { challenges, stats, loading, error } = useGame();
  const [searchParams, setSearchParams] = useSearchParams();

  const [difficulty, setDifficulty] = useState("ALL");

  const selectedCategory = searchParams.get("category") || "ALL";
  const solvedIds = stats?.solved_challenge_ids || [];

  function updateCategory(category) {
    const next = new URLSearchParams(searchParams);

    if (category === "ALL") {
      next.delete("category");
    } else {
      next.set("category", category);
    }

    setSearchParams(next);
  }

  const filteredChallenges = useMemo(() => {
    return challenges.filter((challenge) => {
      const categoryMatches =
        selectedCategory === "ALL" ||
        challenge.category === selectedCategory;

      const difficultyMatches =
        difficulty === "ALL" ||
        challenge.difficulty === difficulty;

      return categoryMatches && difficultyMatches;
    });
  }, [challenges, selectedCategory, difficulty]);

  return (
    <>
      <section className="minimal-welcome">
        <span className="minimal-kicker">OPERATION FLAGFALL / CHALLENGES</span>
        <h1>Find your next <span>target.</span></h1>
        <p>Browse challenges, submit flags, and earn points.</p>
      </section>

      {error && (
        <p className="dashboard-message" role="alert">{error}</p>
      )}

      <section className="minimal-section">
        <div className="minimal-section-heading">
          <div>
            <span className="minimal-kicker">FILTER AND EXPLORE</span>
            <h2>All Challenges</h2>
          </div>

          <span className="muted-count">
            {loading ? "LOADING..." : `${filteredChallenges.length} RESULTS`}
          </span>
        </div>

        <div className="challenge-filters">
          <div className="filter-group">
            <label htmlFor="category-filter">CATEGORY</label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(event) => updateCategory(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category.code} value={category.code}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="difficulty-filter">DIFFICULTY</label>
            <select
              id="difficulty-filter"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
            >
              {difficulties.map((level) => (
                <option key={level} value={level}>
                  {level === "ALL" ? "All Difficulties" : level}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="minimal-empty">
            <p>Loading challenges...</p>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="minimal-empty">
            <span>—</span>
            <p>No challenges match your selected filters.</p>
          </div>
        ) : (
          <div className="challenge-grid">
            {filteredChallenges.map((challenge) => {
              const solved = solvedIds.includes(challenge.id);

              return (
                <Link
                  to={`/challenge/${challenge.id}`}
                  className="challenge-card-link"
                  key={challenge.id}
                >
                  <article className="challenge-card">
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
                      <span>
                        {solved ? "✓ Completed" : "View challenge →"}
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
