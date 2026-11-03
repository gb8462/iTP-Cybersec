
export default function Leaderboard() {
  return (
    <>
      <section className="minimal-welcome">
        <span className="minimal-kicker">OPERATION FLAGFALL / RANKINGS</span>
        <h1>Who's <span>leading?</span></h1>
        <p>Track the competition and see who's capturing the most flags.</p>
      </section>

      <section className="minimal-section">
        <div className="minimal-section-heading">
          <div>
            <span className="minimal-kicker">TOP PLAYERS</span>
            <h2>Leaderboard</h2>
          </div>

          <span className="muted-count">RANKINGS</span>
        </div>

        <div className="minimal-empty">
          <span>—</span>
          <p>Leaderboard integration is coming next.</p>
        </div>
      </section>
    </>
  );
}
