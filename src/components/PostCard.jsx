import { BUCKET_GRADIENTS, PLATFORM_ICONS } from "../lib/mockData";

export default function PostCard({ post, actions, compact }) {
  const gradClass = BUCKET_GRADIENTS[post.bucket] || "bucket-talent";
  const icon = PLATFORM_ICONS[post.platform] || "✦";

  return (
    <div className="card" style={{ overflow: "hidden", padding: 0 }}>
      {/* Gradient thumb */}
      <div className={gradClass} style={{
        height: compact ? 80 : 140,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 20px",
        position: "relative",
      }}>
        <p style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontStyle: "italic",
          fontSize: compact ? 14 : 17,
          color: "white",
          textAlign: "center",
          lineHeight: 1.4,
          margin: 0,
        }}>
          "{post.pullQuote}"
        </p>
      </div>

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="label-eyebrow" style={{ color: "var(--electric)" }}>{post.bucket}</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{icon} {post.platform}</span>
        </div>

        <p style={{ fontSize: 14, color: "var(--twilight)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: compact ? 3 : 999, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {post.caption}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
          <span>{post.scheduledDay} · {post.scheduledTime}</span>
          <StatusBadge status={post.status} />
        </div>

        {actions && <div style={{ display: "flex", gap: 8, marginTop: 4 }}>{actions}</div>}
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    pending:   { bg: "rgba(108,0,255,0.08)",  color: "var(--electric)" },
    approved:  { bg: "rgba(0,180,80,0.1)",    color: "#00A550" },
    discarded: { bg: "rgba(200,0,0,0.08)",    color: "#CC2200" },
    scheduled: { bg: "rgba(0,51,255,0.08)",   color: "var(--bright)" },
  };
  const s = styles[status] || styles.pending;
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      fontSize: 11,
      fontWeight: 600,
      padding: "3px 9px",
      borderRadius: 10,
      textTransform: "capitalize",
    }}>
      {status}
    </span>
  );
}
