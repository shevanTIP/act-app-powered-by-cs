import { useState } from "react";
import { BUCKET_GRADIENTS, PLATFORM_ICONS } from "../lib/mockData";
import { useApp, useToast } from "../context/AppContext";
import { regeneratePost } from "../lib/anthropic";

export default function SwipeStack() {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const [animating, setAnimating] = useState(null); // 'left' | 'right'
  const [editing, setEditing] = useState(false);
  const [editCaption, setEditCaption] = useState("");
  const [regenerating, setRegenerating] = useState(false);

  const pending = state.posts.filter(p => p.status === "pending");
  const topPost = pending[0];

  const handleAction = (direction) => {
    if (!topPost || animating) return;
    setAnimating(direction);
    setTimeout(() => {
      if (direction === "right") {
        dispatch({ type: "APPROVE_POST", payload: topPost.id });
        showToast("Post approved ✓");
      } else {
        dispatch({ type: "DISCARD_POST", payload: topPost.id });
        showToast("Post discarded");
      }
      setAnimating(null);
    }, 350);
  };

  const openEdit = () => {
    setEditCaption(topPost.caption);
    setEditing(true);
  };

  const saveEdit = () => {
    dispatch({ type: "UPDATE_POST_CAPTION", payload: { id: topPost.id, caption: editCaption } });
    setEditing(false);
    showToast("Caption updated.");
  };

  const handleRegenerate = async () => {
    if (regenerating || !topPost) return;
    const remaining = state.generationsLimit - state.generationsUsed;
    if (remaining < 1) { showToast("Generation limit reached.", "error"); return; }
    setRegenerating(true);
    try {
      const newPost = await regeneratePost({ voiceGuide: state.voiceGuide, existingPost: topPost, platforms: state.platformPrefs });
      dispatch({ type: "REPLACE_POST", payload: { ...newPost, id: topPost.id } });
      showToast("New angle generated.");
    } catch (err) {
      showToast(err.message || "Regeneration failed.", "error");
    } finally {
      setRegenerating(false);
    }
  };

  if (!topPost) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 420, gap: 16 }}>
        <span style={{ fontSize: 48 }}>✓</span>
        <h3 style={{ color: "var(--ink)" }}>All caught up!</h3>
        <p style={{ color: "var(--muted)", textAlign: "center" }}>No posts waiting for review. Generate more from the Dashboard.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Generation bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span className="label-eyebrow">Generations this week</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{state.generationsUsed} / {state.generationsLimit}</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${(state.generationsUsed / state.generationsLimit) * 100}%` }} />
        </div>
      </div>

      {/* Card stack */}
      <div style={{ position: "relative", height: 460, marginBottom: 28 }}>
        {pending.slice(0, 3).map((post, i) => (
          <SwipeCardItem
            key={post.id}
            post={post}
            index={i}
            isTop={i === 0}
            animating={i === 0 ? animating : null}
          />
        ))}
      </div>

      {/* Pending count */}
      <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
        {pending.length} post{pending.length !== 1 ? "s" : ""} selected
      </p>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
        <button
          onClick={() => handleAction("left")}
          disabled={!!animating}
          style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "var(--surface)", border: "2px solid #FF4444",
            fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}
          title="Discard"
        >✕</button>

        <button
          onClick={openEdit}
          disabled={!!animating}
          style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "var(--surface)", border: "2px solid var(--border)",
            fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}
          title="Edit"
        >✎</button>

        <button
          onClick={() => handleAction("right")}
          disabled={!!animating}
          style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "var(--electric)", border: "none",
            fontSize: 22, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}
          title="Approve"
        >✓</button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="btn-ghost"
          style={{ fontSize: 13, padding: "8px 18px" }}
        >
          {regenerating ? "Regenerating…" : "↺ New angle"}
        </button>
      </div>

      {/* Edit modal */}
      {editing && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(56,10,101,0.4)", zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }} onClick={() => setEditing(false)}>
          <div className="card" style={{ width: "100%", maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: "var(--ink)", marginBottom: 14 }}>Edit Caption</h3>
            <textarea
              value={editCaption}
              onChange={e => setEditCaption(e.target.value)}
              rows={6}
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn-ghost" onClick={() => setEditing(false)} style={{ padding: "10px 18px" }}>Cancel</button>
              <button className="btn-primary" onClick={saveEdit} style={{ padding: "10px 18px" }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SwipeCardItem({ post, index, isTop, animating }) {
  const gradClass = BUCKET_GRADIENTS[post.bucket] || "bucket-talent";
  const icon = PLATFORM_ICONS[post.platform] || "✦";

  const scale = 1 - index * 0.05;
  const translateY = index * 12;
  const translateX = index * 6;
  const opacity = 1 - index * 0.2;

  return (
    <div
      className={animating === "left" ? "slide-out-left" : animating === "right" ? "slide-out-right" : ""}
      style={{
        position: "absolute",
        width: "100%",
        transform: isTop && !animating
          ? "none"
          : `scale(${scale}) translateX(${translateX}px) translateY(${translateY}px)`,
        opacity,
        zIndex: 10 - index,
        transition: isTop ? "none" : "all 0.3s ease",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: isTop ? "0 12px 48px rgba(56,10,101,0.15)" : "none",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        transformOrigin: "bottom center",
      }}
    >
      {/* Gradient header */}
      <div className={gradClass} style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 28px" }}>
        <p style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontStyle: "italic",
          fontSize: 20,
          color: "white",
          textAlign: "center",
          lineHeight: 1.45,
          margin: 0,
        }}>
          "{post.pullQuote}"
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span className="label-eyebrow" style={{ color: "var(--electric)" }}>{post.bucket}</span>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{icon} {post.platform}</span>
        </div>
        <p style={{ fontSize: 14, color: "var(--twilight)", lineHeight: 1.7, marginBottom: 16 }}>
          {post.caption}
        </p>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>
          📅 {post.scheduledDay} · {post.scheduledTime}
        </div>
      </div>
    </div>
  );
}
