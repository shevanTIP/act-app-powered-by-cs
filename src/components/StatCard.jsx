export default function StatCard({ label, value, sub, accent }) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span className="label-eyebrow">{label}</span>
      <span style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 32,
        color: accent ? "var(--electric)" : "var(--ink)",
        lineHeight: 1.1,
      }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: 13, color: "var(--muted)" }}>{sub}</span>}
    </div>
  );
}
