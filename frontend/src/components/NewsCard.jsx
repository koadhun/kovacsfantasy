export default function NewsCard({ item, compact = false }) {
  return (
    <article
      className="news-card"
      style={{
        display: "grid",
        gridTemplateColumns: compact ? "88px 1fr" : "140px 1fr",
        gap: 12,
        alignItems: "center"
      }}
    >
      <div className="news-thumb" aria-hidden="true">
        <div className="news-thumb-overlay" />
        <div className="news-thumb-label">{item.tag}</div>
      </div>

      <div>
        <div className="news-meta">
          <span className="news-source">{item.source}</span>
          <span className="news-dot">•</span>
          <span className="news-time">{item.time}</span>
        </div>
        <h3 className="news-title" style={{ marginTop: 6 }}>
          {item.title}
        </h3>
        {!compact && (
          <p className="muted" style={{ margin: "8px 0 0" }}>
            {item.desc}
          </p>
        )}
      </div>
    </article>
  );
}