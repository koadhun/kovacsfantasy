import { Link } from "react-router-dom";

export default function Fantasy() {
  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">FANTASY</span>
          <span>Games</span>
        </div>
        <h1 className="h1">Fantasy</h1>
        <p className="sub">Válassz egy játékot.</p>
      </div>

      <div className="grid" style={{ marginTop: 14 }}>
        <Link to="/fantasy/weekly-pickem" className="card" style={{ padding: 16, textDecoration: "none" }}>
          <h3 className="card-title" style={{ marginTop: 0 }}>Weekly Pick&apos;Em</h3>
          <p className="muted">Tippeld meg minden meccs győztesét. Pontozás + leaderboard.</p>
          <span className="btn primary" style={{ marginTop: 10, display: "inline-block" }}>Open</span>
        </Link>

        <div className="card" style={{ padding: 16, opacity: 0.75 }}>
          <h3 className="card-title" style={{ marginTop: 0 }}>Perfect challange</h3>
          <p className="muted">Később implementáljuk.</p>
          <span className="btn" style={{ marginTop: 10, display: "inline-block" }} disabled>Coming soon</span>
        </div>

        <div className="card" style={{ padding: 16, opacity: 0.75 }}>
          <h3 className="card-title" style={{ marginTop: 0 }}>Playoff challange</h3>
          <p className="muted">Később implementáljuk.</p>
          <span className="btn" style={{ marginTop: 10, display: "inline-block" }} disabled>Coming soon</span>
        </div>
      </div>
    </div>
  );
}