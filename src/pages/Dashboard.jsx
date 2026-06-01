import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import StatCard from "../components/StatCard";
import WeeklyUpdate from "../components/WeeklyUpdate";

const MOCK_CHART_DATA = [12,18,9,24,15,20,11,28,16,22,8,30,19,25,14,21,17,26,13,23,10,27,18,20,15,24,11,29];
const DAYS = ["M","T","W","T","F","S","S","M","T","W","T","F","S","S","M","T","W","T","F","S","S","M","T","W","T","F","S","S"];

function getDateRange() {
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now); mon.setDate(now.getDate() - ((day + 6) % 7));
  const fri = new Date(mon); fri.setDate(mon.getDate() + 4);
  const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(mon)} – ${fmt(fri)}, ${now.getFullYear()}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { state } = useApp();
  const navigate = useNavigate();
  const pendingCount = state.posts.filter(p => p.status === "pending").length;
  const approvedCount = state.approvedPosts.length;
  const remaining = state.generationsLimit - state.generationsUsed;
  const maxChart = Math.max(...MOCK_CHART_DATA);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 60px" }}>
      {/* Hero strip */}
      <div style={{
        background: "var(--ink)",
        margin: "0 -24px 32px",
        padding: "36px 40px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -80, right: -80, width: 300, height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(108,0,255,0.22) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <img
            src="/brand/logo-white.png"
            alt="The Ikigai Project"
            style={{ height: 32, width: "auto", objectFit: "contain", marginBottom: 20, opacity: 0.9 }}
          />
          <p className="label-eyebrow" style={{ color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>
            {getDateRange()}
          </p>
          <h1 style={{ color: "white", marginBottom: 12 }}>
            {getGreeting()}, {state.voiceGuide.brandName}.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
            {approvedCount} post{approvedCount !== 1 ? "s" : ""} scheduled · {pendingCount} awaiting review · {remaining} generation{remaining !== 1 ? "s" : ""} remaining
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="Posts Scheduled" value={approvedCount} sub="This week" />
        <StatCard label="Generations Left" value={remaining} sub={`of ${state.generationsLimit} this week`} accent />
        <StatCard label="Avg Reach" value="1.4K" sub="Last 28 days (mock)" />
        <StatCard label="Engagement Rate" value="4.2%" sub="Last 28 days (mock)" />
      </div>

      {/* Weekly Update + Quick Actions row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, marginBottom: 28, alignItems: "start" }}>
        <WeeklyUpdate />

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h3 style={{ color: "var(--ink)", marginBottom: 4 }}>Quick Actions</h3>
          {[
            { label: "Review Posts", sub: `${pendingCount} pending`, path: "/swipe", primary: true },
            { label: "View Queue", sub: `${approvedCount} scheduled`, path: "/queue", primary: false },
            { label: "Voice Guide", sub: "Your brand DNA", path: "/voice-guide", primary: false },
            { label: "Setup / Edit Guide", sub: "25-question quiz", path: "/onboarding", primary: false },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={item.primary ? "btn-primary" : "btn-ghost"}
              style={{ width: "100%", justifyContent: "space-between", padding: "11px 16px" }}
            >
              <span>{item.label}</span>
              <span style={{ fontSize: 12, opacity: 0.7 }}>{item.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Engagement chart */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <span className="label-eyebrow">Engagement</span>
            <h3 style={{ color: "var(--ink)", marginTop: 4 }}>Last 28 Days</h3>
          </div>
          <span style={{ fontSize: 12, color: "var(--muted)", background: "var(--off-white)", padding: "4px 10px", borderRadius: 6 }}>Mock data</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 100 }}>
          {MOCK_CHART_DATA.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: "100%",
                height: `${(v / maxChart) * 84}px`,
                background: i === MOCK_CHART_DATA.length - 1 ? "var(--electric)" : "rgba(108,0,255,0.2)",
                borderRadius: "3px 3px 0 0",
                transition: "height 0.3s",
              }} />
              {i % 7 === 0 && (
                <span style={{ fontSize: 9, color: "var(--muted)", whiteSpace: "nowrap" }}>{DAYS[i]}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
