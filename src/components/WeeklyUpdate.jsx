import { useState } from "react";
import { useApp, useToast } from "../context/AppContext";
import { generatePosts } from "../lib/anthropic";

const OCCASION_TAGS = [
  "New client", "Launch", "Milestone", "Industry take", "Seasonal", "Behind the scenes",
];

export default function WeeklyUpdate() {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  const remaining = state.generationsLimit - state.generationsUsed;
  const canGenerate = remaining >= 4;

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    try {
      const context = [state.weeklyUpdate, ...selectedTags].filter(Boolean).join(". ");
      const posts = await generatePosts({ voiceGuide: state.voiceGuide, weeklyUpdate: context, count: 4 });
      dispatch({ type: "ADD_POSTS", payload: posts });
      showToast("4 new posts generated — head to Review to approve them.");
    } catch (err) {
      showToast(err.message || "Generation failed. Check your API key.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-dark" style={{ position: "relative", overflow: "hidden" }}>
      {/* Radial accent */}
      <div style={{
        position: "absolute", top: -60, right: -60, width: 200, height: 200,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(108,0,255,0.18) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <span className="label-eyebrow" style={{ color: "rgba(255,255,255,0.5)" }}>This Week</span>
        <h3 style={{ color: "white", margin: "8px 0 14px" }}>What's happening this week?</h3>

        <textarea
          value={state.weeklyUpdate}
          onChange={e => dispatch({ type: "SET_WEEKLY_UPDATE", payload: e.target.value })}
          placeholder="Any launches, milestones, campaigns, or specific angles you want this week's posts to touch on..."
          rows={3}
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "white", marginBottom: 14 }}
        />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {OCCASION_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              style={{
                padding: "5px 13px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                border: selectedTags.includes(tag) ? "1px solid var(--electric)" : "1px solid rgba(255,255,255,0.2)",
                background: selectedTags.includes(tag) ? "rgba(108,0,255,0.3)" : "rgba(255,255,255,0.08)",
                color: selectedTags.includes(tag) ? "#D4AAFF" : "rgba(255,255,255,0.7)",
                transition: "all 0.15s",
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Generations used this week</span>
              <span style={{ fontSize: 12, color: remaining < 5 ? "#FF8800" : "rgba(255,255,255,0.7)", fontWeight: 600 }}>
                {state.generationsUsed} / {state.generationsLimit}
              </span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${(state.generationsUsed / state.generationsLimit) * 100}%`,
                background: remaining < 5 ? "#FF8800" : "var(--electric)",
                borderRadius: 2,
                transition: "width 0.3s",
              }} />
            </div>
            {remaining < 5 && remaining > 0 && (
              <p style={{ fontSize: 11, color: "#FF8800", marginTop: 4 }}>⚠ Only {remaining} generations remaining</p>
            )}
          </div>

          <button
            className="btn-primary"
            onClick={handleGenerate}
            disabled={loading || !canGenerate}
            style={{ flexShrink: 0 }}
          >
            {loading ? "Generating…" : "Generate this week's posts →"}
          </button>
        </div>

        {!canGenerate && (
          <p style={{ fontSize: 12, color: "rgba(255,165,0,0.9)", marginTop: 10 }}>
            Generation limit reached.{" "}
            <button onClick={() => dispatch({ type: "RESET_GENERATIONS" })} style={{ background: "none", border: "none", color: "var(--electric)", cursor: "pointer", fontSize: 12, padding: 0, fontFamily: "inherit" }}>
              Reset for new week
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
