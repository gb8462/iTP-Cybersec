
import { Link } from "react-router-dom";
import { useGame } from "../context/GameContext";

const categories = [
  {
    name: "Web Exploitation",
    code: "WEB",
    color: "orange",
    description: "Explore vulnerabilities, web applications, and exploitation techniques.",
  },
  {
    name: "Cryptography",
    code: "CRYPTO",
    color: "purple",
    description: "Decode, decrypt, and break cryptographic challenges.",
  },
  {
    name: "Digital Forensics",
    code: "FORENSICS",
    color: "blue",
    description: "Investigate files, artifacts, metadata, and digital evidence.",
  },
  {
    name: "Miscellaneous",
    code: "MISC",
    color: "green",
    description: "Tackle puzzles and challenges that cross multiple disciplines.",
  },
];

export default function Challenges() {
  const { challenges, stats, loading } = useGame();

  const solvedIds = stats?.solved_challenge_ids || [];

  return (
    <>
      <section className="minimal-welcome">
        <span className="minimal-kicker">OPERATION FLAGFALL / DOMAINS</span>
        <h1>Choose your <span>battlefield.</span></h1>
        <p>Select a domain and put your cybersecurity skills to the test.</p>
      </section>

      <section className="minimal-section">
        <div className="minimal-section-heading">
          <div>
            <span className="minimal-kicker">CHALLENGE DOMAINS</span>
            <h2>Explore Categories</h2>
          </div>

          <span className="muted-count">
            {categories.length} CATEGORIES
          </span>
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

                <p className="category-description">
                  {category.description}
                </p>

                <div className="minimal-category-bottom">
                  <span>
                    {loading ? "..." : `${solvedCount} / ${categoryChallenges.length} solved`}
                  </span>
                  <span>
                    {loading ? "Loading" : `${categoryChallenges.length} available`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
