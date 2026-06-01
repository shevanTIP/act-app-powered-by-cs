import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, useToast } from "../context/AppContext";
import { StatusBadge } from "../components/PostCard";
import { BUCKET_GRADIENTS, PLATFORM_ICONS, ALL_PLATFORMS } from "../lib/mockData";
import { GHL_INTEGRATION } from "../lib/anthropic";

const DAYS = ["Monday", "Wednesday", "Thursday", "Friday"];

function fmt(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getPostPlatforms(post) {
  return post.platforms || [post.platform];
}

function QueuePostCard({ post, onTogglePlatform, onScheduleGHL, ghlConnected }) {
  const gradClass = BUCKET_GRADIENTS[post.bucket] || "bucket-talent";
  const platforms = getPostPlatforms(post);

  return (
    <div className="card" style={{ overflow: "hidden", padding: 0, display: "flex", flexDirection: "column" }}>
      {/* Gradient thumb */}
      <div className={gradClass} style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 16px" }}>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontStyle: "italic", fontSize: 13, color: "white", textAlign: "center", lineHeight: 1.4, margin: 0 }}>
          "{post.pullQuote}"
        </p>
      </div>

      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="label-eyebrow" style={{ color: "var(--electric)" }}>{post.bucket}</span>
          <StatusBadge status={post.status} />
        </div>

        <p style={{ fontSize: 13, color: "var(--twilight)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", margin: 0 }}>
          {post.caption}
        </p>

        <span style={{ fontSize: 12, color: "var(--muted)" }}>{post.scheduledDay} · {post.scheduledTime}</span>

        {/* Per-post platform selector */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1.5px", display: "block", marginBottom: 8 }}>
            Schedule to
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {ALL_PLATFORMS.map(p => {
              const active = platforms.includes(p);
              const isLast = active && platforms.length === 1;
              return (
                <button
                  key={p}
                  onClick={() => onTogglePlatform(post.id, p, platforms)}
                  title={isLast ? "At least one platform required" : ""}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "4px 10px", borderRadius: 16, fontSize: 11, fontWeight: 500,
                    cursor: isLast ? "not-allowed" : "pointer",
                    fontFamily: "'Inter', sans-serif",
                    border: active ? "1px solid var(--electric)" : "1px solid var(--border)",
                    background: active ? "rgba(108,0,255,0.08)" : "transparent",
                    color: active ? "var(--electric)" : "var(--muted)",
                    transition: "all 0.15s",
                    opacity: isLast ? 0.5 : 1,
                  }}
                >
                  <span style={{ fontSize: 12 }}>{PLATFORM_ICONS[p]}</span>
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* GHL action */}
        {post.status === "approved" && (
          <button
            onClick={() => onScheduleGHL(post)}
            className="btn-ghost"
            style={{ fontSize: 12, padding: "8px 12px", justifyContent: "center", width: "100%" }}
            title={ghlConnected ? `Push to ${platforms.join(", ")}` : "GHL not connected"}
          >
            {post.status === "scheduled"
              ? `✓ In GHL · ${platforms.join(", ")}`
              : `→ Push to GHL (${platforms.join(", ")})`}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Queue() {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [discardedOpen, setDiscardedOpen] = useState(true);

  const allPosts = [...state.posts, ...state.approvedPosts];
  const byDay = (day) => allPosts.find(p => p.scheduledDay === day);
  const discarded = state.discardedPosts;

  const handleTogglePlatform = (id, platform, currentPlatforms) => {
    if (currentPlatforms.includes(platform) && currentPlatforms.length === 1) return;
    const next = currentPlatforms.includes(platform)
      ? currentPlatforms.filter(p => p !== platform)
      : [...currentPlatforms, platform];
    dispatch({ type: "SET_POST_PLATFORMS", payload: { id, platforms: next } });
  };

  const handleRestore = (id) => {
    dispatch({ type: "RESTORE_POST", payload: id });
    showToast("Post restored to queue.");
  };

  const handleDelete = (id) => {
    dispatch({ type: "DELETE_DISCARDED", payload: id });
    showToast("Removed from archive.");
  };

  const handleClearAll = () => {
    dispatch({ type: "CLEAR_DISCARDED" });
    showToast("Discarded archive cleared.");
  };

  const handleScheduleGHL = async (post) => {
    if (!state.ghlConfig.connected) {
      showToast("GHL not connected — configure in Settings.", "error");
      return;
    }
    try {
      await GHL_INTEGRATION.pushToGHL(post, state.ghlConfig);
      dispatch({ type: "MARK_SCHEDULED", payload: post.id });
      const platforms = getPostPlatforms(post);
      showToast(`"${post.scheduledDay}" pushed to ${platforms.join(", ")}.`);
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
          return (
            <div key={day} style={{
              flex: "1 1 100px", minWidth: 90, padding: "12px 14px", borderRadius: 10, textAlign: "center",
              background: post?.status === "approved" ? "rgba(0,180,80,0.08)" : post?.status === "pending" ? "rgba(108,0,255,0.08)" : "var(--surface)",
              border: "1px solid var(--border)",
            }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>{day.slice(0,3)}</p>
              {post ? <StatusBadge status={post.status} /> : <span style={{ fontSize: 11, color: "var(--muted)" }}>—</span>}
            </div>
          );
        })}
      </div>

      {/* 4-post grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 16, marginBottom: 40 }}>
        {DAYS.map(day => {
          const post = byDay(day);
          if (!post) {
            return (
              <button
                key={day}
                onClick={() => navigate("/dashboard")}
                style={{
                  border: "2px dashed var(--border)", borderRadius: 14, padding: "40px 20px",
                  background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 8, color: "var(--muted)", fontFamily: "'Inter', sans-serif",
                }}
              >
                <span style={{ fontSize: 24 }}>+</span>
                <span style={{ fontSize: 13 }}>Generate post</span>
                <span style={{ fontSize: 11, opacity: 0.6 }}>{day}</span>
              </button>
            );
          }
          return (
            <QueuePostCard
              key={post.id}
              post={post}
              onTogglePlatform={handleTogglePlatform}
              onScheduleGHL={handleScheduleGHL}
              ghlConnected={state.ghlConfig.connected}
            />
          );
        })}
      </div>

      {/* GHL status banner */}
      <div className="card" style={{ marginBottom: 40, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <span className="label-eyebrow">GoHighLevel Integration</span>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            {state.ghlConfig.connected
              ? `Connected · Location: ${state.ghlConfig.locationId}`
              : "Not connected — configure to push approved posts directly to GHL Social Planner."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 10, background: state.ghlConfig.connected ? "rgba(0,180,80,0.1)" : "rgba(200,100,0,0.1)", color: state.ghlConfig.connected ? "#00A550" : "#CC6600" }}>
            {state.ghlConfig.connected ? "Connected" : "Pending Setup"}
          </span>
          <button className="btn-ghost" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => navigate("/onboarding?tab=integrations")}>
            Configure
          </button>
        </div>
      </div>

      {/* Discarded archive */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, cursor: "pointer" }} onClick={() => setDiscardedOpen(o => !o)}>
          <div>
            <span className="label-eyebrow">Discarded Archive</span>
            <span style={{ marginLeft: 10, fontSize: 12, background: "rgba(108,0,255,0.08)", color: "var(--electric)", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
              {discarded.length}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {discarded.length > 0 && discardedOpen && (
              <button onClick={e => { e.stopPropagation(); handleClearAll(); }} style={{ background: "none", border: "none", fontSize: 12, color: "var(--muted)", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
                Clear all
              </button>
            )}
            <span style={{ fontSize: 16, color: "var(--muted)", userSelect: "none" }}>{discardedOpen ? "▾" : "▸"}</span>
          </div>
        </div>

        {discardedOpen && (
          discarded.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14 }}>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>No discarded posts yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {discarded.slice().reverse().map(post => (
                <div key={post.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
                  <div className={
                    post.bucket === "Talent → Business" ? "bucket-talent"
                    : post.bucket === "Real Access" ? "bucket-access"
                    : post.bucket === "Behind the Process" ? "bucket-behind"
                    : post.bucket === "Infrastructure" ? "bucket-infra"
                    : "bucket-industry"
                  } style={{ height: 4 }} />
                  <div style={{ padding: "14px 18px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span className="label-eyebrow" style={{ color: "var(--electric)" }}>{post.bucket}</span>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>{PLATFORM_ICONS[post.platform] || "✦"} {post.platform}</span>
                        {post.discardedAt && <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: "auto" }}>Discarded {fmt(post.discardedAt)}</span>}
                      </div>
                      <p style={{ fontSize: 13, color: "var(--twilight)", lineHeight: 1.6, margin: 0 }}>{post.caption}</p>
                      {post.pullQuote && <p style={{ fontSize: 12, fontStyle: "italic", color: "var(--muted)", marginTop: 6, fontFamily: "'Space Grotesk', sans-serif" }}>"{post.pullQuote}"</p>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                      <button className="btn-ghost" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => handleRestore(post.id)}>Restore</button>
                      <button onClick={() => handleDelete(post.id)} style={{ background: "none", border: "none", fontSize: 12, color: "var(--muted)", cursor: "pointer", fontFamily: "inherit", padding: "6px 14px", textAlign: "center" }}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
