import { useNavigate } from "react-router-dom";
import { useApp, useToast } from "../context/AppContext";
import PostCard, { StatusBadge } from "../components/PostCard";
import { BUCKET_GRADIENTS, PLATFORM_ICONS, GHL_PLACEHOLDER } from "../lib/mockData";
import { GHL_INTEGRATION } from "../lib/anthropic";

const DAYS = ["Monday", "Wednesday", "Thursday", "Friday"];

export default function Queue() {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const allPosts = [...state.posts, ...state.approvedPosts];
  const byDay = (day) => allPosts.find(p => p.scheduledDay === day);

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentDiscards = state.discardedPosts.filter(p => !p.discardedAt || p.discardedAt > sevenDaysAgo);

  const handleRestore = (id) => {
    dispatch({ type: "RESTORE_POST", payload: id });
    showToast("Post restored to queue.");
  };

  const handleScheduleGHL = async (post) => {
    if (!state.ghlConfig.connected) {
      showToast("GHL not connected — configure in Settings.", "error");
      return;
    }
    try {
      await GHL_INTEGRATION.pushToGHL(post, state.ghlConfig);
      dispatch({ type: "MARK_SCHEDULED", payload: post.id });
      showToast(`"${post.scheduledDay}" post pushed to GHL.`);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ marginBottom: 28 }}>
        <span className="label-eyebrow">Content Queue</span>
        <h2 style={{ color: "var(--ink)", marginTop: 6 }}>This Week's Schedule</h2>
      </div>

      {/* Week schedule strip */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, overflowX: "auto", paddingBottom: 4 }}>
        {["Monday","Tuesday","Wednesday","Thursday","Friday"].map(day => {
          const post = allPosts.find(p => p.scheduledDay === day);
          const isRest = !["Monday","Wednesday","Thursday","Friday"].includes(day) || !post;
          return (
            <div key={day} style={{
              flex: "1 1 100px",
              minWidth: 90,
              padding: "12px 14px",
              borderRadius: 10,
              background: post?.status === "approved" ? "rgba(0,180,80,0.08)"
                : post?.status === "pending" ? "rgba(108,0,255,0.08)"
                : "var(--surface)",
              border: `1px solid ${post ? "var(--border)" : "var(--border)"}`,
              textAlign: "center",
            }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>{day.slice(0,3)}</p>
              {post ? (
                <StatusBadge status={post.status} />
              ) : (
                <span style={{ fontSize: 11, color: "var(--muted)" }}>—</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 4-post grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 40 }}>
        {DAYS.map(day => {
          const post = byDay(day);
          if (!post) {
            return (
              <button
                key={day}
                onClick={() => navigate("/dashboard")}
                style={{
                  border: "2px dashed var(--border)",
                  borderRadius: 14,
                  padding: "40px 20px",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--muted)",
                  fontFamily: "'Inter', sans-serif",
                  transition: "background 0.15s",
                }}
              >
                <span style={{ fontSize: 24 }}>+</span>
                <span style={{ fontSize: 13 }}>Generate post</span>
                <span style={{ fontSize: 11, opacity: 0.6 }}>{day}</span>
              </button>
            );
          }
          return (
            <PostCard
              key={post.id}
              post={post}
              compact
              actions={
                post.status === "approved" ? [
                  <button
                    key="ghl"
                    onClick={() => handleScheduleGHL(post)}
                    className="btn-ghost"
                    style={{ flex: 1, fontSize: 12, padding: "8px 12px", justifyContent: "center" }}
                    title={state.ghlConfig.connected ? "Push to GHL" : "GHL not connected"}
                  >
                    {post.status === "scheduled" ? "✓ In GHL" : "→ Push to GHL"}
                  </button>
                ] : []
              }
            />
          );
        })}
      </div>

      {/* GHL status banner */}
      <div className="card" style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <span className="label-eyebrow">GoHighLevel Integration</span>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            {state.ghlConfig.connected
              ? `Connected · Location: ${state.ghlConfig.locationId}`
              : "Not connected — configure to push approved posts directly to GHL Social Planner."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 10,
            background: state.ghlConfig.connected ? "rgba(0,180,80,0.1)" : "rgba(200,100,0,0.1)",
            color: state.ghlConfig.connected ? "#00A550" : "#CC6600",
          }}>
            {state.ghlConfig.connected ? "Connected" : "Pending Setup"}
          </span>
          <button className="btn-ghost" style={{ fontSize: 12, padding: "6px 14px" }}
            onClick={() => navigate("/onboarding?tab=integrations")}>
            Configure
          </button>
        </div>
      </div>

      {/* Discarded posts */}
      {recentDiscards.length > 0 && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <span className="label-eyebrow">Discarded Posts</span>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Restored within 7 days</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentDiscards.map(post => (
              <div key={post.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "12px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="label-eyebrow" style={{ color: "var(--electric)" }}>{post.bucket}</span>
                  <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.caption}</p>
                </div>
                <button className="btn-ghost" style={{ fontSize: 12, padding: "7px 14px", flexShrink: 0 }} onClick={() => handleRestore(post.id)}>
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
