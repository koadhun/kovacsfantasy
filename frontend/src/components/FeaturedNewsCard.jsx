export default function FeaturedNewsCard({ item }) {
  return (
    <article className="featured">
      <div className="featured-media" aria-hidden="true">
        <div className="featured-overlay" />
        <div className="featured-badge">{item.tag}</div>
      </div>

      <div className="featured-body">
        <div className="news-meta">
          <span className="news-source">{item.source}</span>
          <span className="news-dot">•</span>
          <span className="news-time">{item.time}</span>
        </div>
        <h2 className="featured-title">{item.title}</h2>
        <p className="muted" style={{ margin: "10px 0 0" }}>
          {item.desc}
        </p>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn primary">Read story</button>
          <button className="btn">Save</button>
        </div>
      </div>
    </article>
  );
}