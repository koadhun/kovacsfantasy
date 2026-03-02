import FeaturedNewsCard from "../components/FeaturedNewsCard";
import NewsCard from "../components/NewsCard";

const MOCK_NEWS = [
  {
    id: "1",
    tag: "TOP STORY",
    source: "KovacsFantasy Wire",
    time: "2h ago",
    title: "Power rankings shake-up: contenders, pretenders, and a surprise riser",
    desc: "A modern, NFL-hangulatú feed – később API-ról jöhetnek a valódi hírek és képek."
  },
  {
    id: "2",
    tag: "INJURY",
    source: "KovacsFantasy Wire",
    time: "4h ago",
    title: "Injury report: key updates that could change Sunday matchups",
    desc: "Placeholder összefoglaló: státuszok, limited practice, questionable / doubtful."
  },
  {
    id: "3",
    tag: "FANTASY",
    source: "KovacsFantasy Wire",
    time: "6h ago",
    title: "Start/Sit: 5 players to target and 3 to fade this week",
    desc: "Placeholder: matchup-alapú gondolkodás, volume, red zone share."
  },
  {
    id: "4",
    tag: "ANALYSIS",
    source: "KovacsFantasy Wire",
    time: "8h ago",
    title: "Film room: why this offense is finally clicking",
    desc: "Placeholder: protection, motion usage, play-action rate, efficiency."
  },
  {
    id: "5",
    tag: "DRAFT",
    source: "KovacsFantasy Wire",
    time: "12h ago",
    title: "Prospect spotlight: 3 names climbing boards fast",
    desc: "Placeholder: measurables, production profile, scheme fit."
  },
  {
    id: "6",
    tag: "ODDS",
    source: "KovacsFantasy Wire",
    time: "1d ago",
    title: "Lines & leans: what the market is telling us",
    desc: "Placeholder: movement, implied totals, injury-driven volatility."
  }
];

export default function News() {
  const featured = MOCK_NEWS[0];
  const rest = MOCK_NEWS.slice(1);

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">NEWS</span>
          <span>NFL-szerű feed (kártyák, meta, trending)</span>
        </div>
        <h1 className="h1">Hírek</h1>
        <p className="sub">
          Featured sztori + listás feed. Később: valódi képek és backendről érkező hírek.
        </p>
      </div>

      <div className="grid">
        {/* Main column */}
        <div className="col-8">
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <FeaturedNewsCard item={featured} />
          </div>

          <div style={{ height: 14 }} />

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>Latest</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {rest.map((n) => (
                <div key={n.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
                  <NewsCard item={n} />
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button className="btn">Load more</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-4">
          <div className="card">
            <h3 className="card-title">Trending</h3>
            <p className="muted" style={{ marginTop: 6 }}>
              Gyors témák – később dinamikus.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              {rest.slice(0, 4).map((n) => (
                <div key={n.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                  <NewsCard item={n} compact />
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 14 }} />

          <div className="card">
            <h3 className="card-title">Game Center</h3>
            <p className="muted" style={{ margin: 0 }}>
              Következő fázis: meccsek, heti schedule, matchup részletek.
            </p>
            <div style={{ marginTop: 12 }}>
              <button className="btn primary">Open</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}