
import { useCallback, useEffect, useState } from "react";
import { useGame } from "../context/GameContext";
import "../styles/leaderboard.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const formatPoints = (points) =>
  new Intl.NumberFormat().format(points || 0);

const MEDALS = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export default function Leaderboard() {
  const { user } = useGame();

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/challenges/leaderboard/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      if (!response.ok) {
        throw new Error("Unable to load leaderboard rankings.");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The server returned an invalid leaderboard response.");
      }

      setPlayers(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const podiumOrder = { 2: 0, 1: 1, 3: 2 };
  
  const topThree = players
    .filter((player) => player.rank <= 3)
    .sort((a, b) => podiumOrder[a.rank] - podiumOrder[b.rank]);

  const isCurrentPlayer = (player) =>
    Number(player.participant_id) === Number(user?.id);

  return (
    <>
      <section className="minimal-welcome">
        <span className="minimal-kicker">
          OPERATION FLAGFALL / RANKINGS
        </span>

        <h1>
          Who's <span>leading?</span>
        </h1>

        <p>
          Track the competition and see who's capturing the most flags.
        </p>
      </section>

      <section className="minimal-section leaderboard-section">
        <div className="minimal-section-heading">
          <div>
            <span className="minimal-kicker">COMPETITION STANDINGS</span>
            <h2>Leaderboard</h2>
          </div>

          <button
            className="leaderboard-refresh"
            onClick={fetchLeaderboard}
            disabled={loading}
            type="button"
          >
            ↻ {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading && (
          <div className="leaderboard-state">
            <div className="leaderboard-loader" />
            <p>Loading player rankings...</p>
          </div>
        )}

        {!loading && error && (
          <div className="leaderboard-state leaderboard-error">
            <span>!</span>
            <p>{error}</p>
            <button onClick={fetchLeaderboard} type="button">
              Try again
            </button>
          </div>
        )}

        {!loading && !error && players.length === 0 && (
          <div className="leaderboard-state">
            <span>—</span>
            <h3>No rankings yet</h3>
            <p>
              The leaderboard will appear once players start capturing flags.
            </p>
          </div>
        )}

        {!loading && !error && players.length > 0 && (
          <>
            {topThree.length > 0 && (
              <div className="leaderboard-podium">
                {topThree.map((player) => (
                  <div
                    className={`podium-card podium-rank-${player.rank} ${
                      isCurrentPlayer(player) ? "is-current-player" : ""
                    }`}
                    key={player.participant_id}
                  >
                    <span className="podium-medal">
                      {MEDALS[player.rank]}
                    </span>

                    <span className="podium-rank">
                      RANK #{player.rank}
                    </span>

                    <h3>{player.display_name}</h3>

                    {isCurrentPlayer(player) && (
                      <span className="leaderboard-you">YOU</span>
                    )}

                    <strong>
                      {formatPoints(player.total_points)}
                    </strong>

                    <span className="podium-points-label">POINTS</span>

                    <span className="podium-solves">
                      {player.challenges_solved} challenges solved
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="leaderboard-table-wrapper">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>RANK</th>
                    <th>PLAYER</th>
                    <th>CHALLENGES</th>
                    <th>POINTS</th>
                  </tr>
                </thead>

                <tbody>
                  {players.map((player) => (
                    <tr
                      key={player.participant_id}
                      className={
                        isCurrentPlayer(player) ? "current-player-row" : ""
                      }
                    >
                      <td className="leaderboard-rank-cell">
                        {MEDALS[player.rank] || `#${player.rank}`}
                      </td>

                      <td className="leaderboard-player-cell">
                        <span>{player.display_name}</span>
                        {isCurrentPlayer(player) && (
                          <span className="leaderboard-you">YOU</span>
                        )}
                      </td>

                      <td>{player.challenges_solved}</td>

                      <td className="leaderboard-points-cell">
                        {formatPoints(player.total_points)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="leaderboard-note">
              Rankings are based on total points, followed by challenges
              solved and solve time.
            </p>
          </>
        )}
      </section>
    </>
  );
}
