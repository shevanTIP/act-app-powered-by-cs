import { NavLink } from "react-router-dom";
import { useApp, useToast } from "../context/AppContext";
import { mockPosts } from "../lib/mockData";

const tabs = [
  { to: "/onboarding",  label: "Setup" },
  { to: "/dashboard",   label: "Dashboard" },
  { to: "/queue",       label: "Queue", badge: true },
  { to: "/assets",      label: "Assets" },
  { to: "/voice-guide", label: "Voice Guide" },
  { to: "/swipe",       label: "Review Posts" },
];

export default function Nav() {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const pendingCount = state.posts.filter(p => p.status === "pending").length;

  const resetDemo = () => {
    dispatch({ type: "RESET_DEMO", payload: mockPosts });
    showToast("Demo reset — 3 posts restored.");
  };

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      height: 56,
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      gap: 0,
    }}>
      {/* Ikigai logo */}
      <div style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <img
          src="/brand/logo-black.png"
          alt="The Ikigai Project"
          style={{ height: 28, width: "auto", objectFit: "contain" }}
        />
        <div style={{
          width: 1,
          height: 20,
          background: "var(--border)",
        }} />
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--ink)",
          letterSpacing: "0.04em",
        }}>
          ACT
        </span>
      </div>

      {/* Reset demo — centred */}
      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
        <button
          onClick={resetDemo}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "none", border: "1px dashed var(--border)",
            borderRadius: 7, padding: "4px 12px", cursor: "pointer",
            fontSize: 11, fontWeight: 500, color: "var(--muted)",
            fontFamily: "'Inter', sans-serif", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--electric)"; e.currentTarget.style.color = "var(--electric)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.color = ""; }}
          title="Restore mock posts for demo"
        >
          ↺ Reset demo
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4 }}>
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              fontFamily: "'Inter', sans-serif",
              background: isActive ? "var(--ink)" : "transparent",
              color: isActive ? "white" : "var(--muted)",
              transition: "all 0.15s",
            })}
          >
            {tab.label}
            {tab.badge && pendingCount > 0 && (
              <span style={{
                background: "var(--electric)",
                color: "white",
                fontSize: 10,
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: 10,
                minWidth: 18,
                textAlign: "center",
              }}>
                {pendingCount}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Powered by Cloudsprout */}
      <div style={{ marginLeft: 20, display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500, letterSpacing: "0.04em" }}>powered by</span>
        <img
          src="/brand/cloudsprout.png"
          alt="Cloudsprout"
          style={{ height: 20, width: "auto", objectFit: "contain", opacity: 0.85 }}
        />
      </div>
    </nav>
  );
}
