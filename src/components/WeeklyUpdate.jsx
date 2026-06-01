import { useState } from "react";
import { useApp, useToast } from "../context/AppContext";
import { generatePosts } from "../lib/anthropic";

const OCCASION_TAGS = [
  "New client", "Launch", "Milestone", "Industry take", "Seasonal", "Behind the scenes",
];

function EventRow({ event, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [note, setNote] = useState(event.note || "");
  const [date, setDate] = useState(event.date || "");

  const save = () => {
    onUpdate({ ...event, title, note, date });
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Event title"
          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "white", borderRadius: 6, padding: "7px 10px", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none", width: "100%" }}
          autoFocus
        />
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={date}
            onChange={e => setDate(e.target.value)}
            placeholder="Date (e.g. Mon Jun 3)"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "white", borderRadius: 6, padding: "7px 10px", fontSize: 12, fontFamily: "'Inter', sans-serif", outline: "none", flex: 1 }}
          />
        </div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Any extra detail for the AI (optional)"
          rows={2}
          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "white", borderRadius: 6, padding: "7px 10px", fontSize: 12, fontFamily: "'Inter', sans-serif", outline: "none", resize: "vertical", width: "100%" }}
        />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={() => setEditing(false)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={save} disabled={!title.trim()} style={{ background: "var(--electric)", border: "none", color: "white", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Save</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "10px 12px" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{event.title}</span>
          {event.date && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.08)", padding: "2px 7px", borderRadius: 10 }}>{event.date}</span>}
        </div>
        {event.note && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "3px 0 0", lineHeight: 1.4 }}>{event.note}</p>}
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 13, padding: "2px 6px", fontFamily: "inherit" }} title="Edit">✎</button>
        <button onClick={() => onRemove(event.id)} style={{ background: "none", border: "none", color: "rgba(255,100,100,0.5)", cursor: "pointer", fontSize: 14, padding: "2px 6px", fontFamily: "inherit" }} title="Remove">×</button>
      </div>
    </div>
  );
}

export default function WeeklyUpdate() {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [addingEvent, setAddingEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventNote, setNewEventNote] = useState("");

  const remaining = state.generationsLimit - state.generationsUsed;
  const canGenerate = remaining >= 4;

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const addEvent = () => {
    if (!newEventTitle.trim()) return;
    dispatch({
      type: "ADD_EVENT",
      payload: { id: `evt-${Date.now()}`, title: newEventTitle.trim(), date: newEventDate.trim(), note: newEventNote.trim() },
    });
    setNewEventTitle("");
    setNewEventDate("");
    setNewEventNote("");
    setAddingEvent(false);
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    try {
      const parts = [];
      if (state.weeklyUpdate) parts.push(state.weeklyUpdate);
      if (selectedTags.length) parts.push(`Occasion tags: ${selectedTags.join(", ")}.`);
      if (state.weeklyEvents.length) {
        const evtLines = state.weeklyEvents.map(e => `- ${e.title}${e.date ? ` (${e.date})` : ""}${e.note ? `: ${e.note}` : ""}`).join("\n");
        parts.push(`Specific business events this week that need coverage:\n${evtLines}`);
      }
      const posts = await generatePosts({ voiceGuide: state.voiceGuide, weeklyUpdate: parts.join("\n\n"), count: 4 });
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
      <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(108,0,255,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <span className="label-eyebrow" style={{ color: "rgba(255,255,255,0.5)" }}>This Week</span>
        <h3 style={{ color: "white", margin: "8px 0 14px" }}>What's happening this week?</h3>

        {/* Context textarea */}
        <textarea
          value={state.weeklyUpdate}
          onChange={e => dispatch({ type: "SET_WEEKLY_UPDATE", payload: e.target.value })}
          placeholder="General context, campaigns, angles you want this week's posts to touch on…"
          rows={2}
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "white", marginBottom: 14 }}
        />

        {/* Occasion tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {OCCASION_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              style={{
                padding: "5px 13px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer",
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

        {/* Weekly events */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "1.5px" }}>
              Business Events
            </span>
            {state.weeklyEvents.length > 0 && (
              <button
                onClick={() => dispatch({ type: "CLEAR_EVENTS" })}
                style={{ background: "none", border: "none", color: "rgba(255,100,100,0.5)", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}
              >
                Clear all
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {state.weeklyEvents.map(event => (
              <EventRow
                key={event.id}
                event={event}
                onUpdate={payload => dispatch({ type: "UPDATE_EVENT", payload })}
                onRemove={id => dispatch({ type: "REMOVE_EVENT", payload: id })}
              />
            ))}

            {addingEvent ? (
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  placeholder="Event title (e.g. New client onboarding, Product launch)"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "white", borderRadius: 6, padding: "7px 10px", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none", width: "100%" }}
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && addEvent()}
                />
                <input
                  type="text"
                  value={newEventDate}
                  onChange={e => setNewEventDate(e.target.value)}
                  placeholder="Date (e.g. Mon Jun 3) — optional"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "white", borderRadius: 6, padding: "7px 10px", fontSize: 12, fontFamily: "'Inter', sans-serif", outline: "none", width: "100%" }}
                />
                <textarea
                  value={newEventNote}
                  onChange={e => setNewEventNote(e.target.value)}
                  placeholder="Extra detail for the AI — optional"
                  rows={2}
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "white", borderRadius: 6, padding: "7px 10px", fontSize: 12, fontFamily: "'Inter', sans-serif", outline: "none", resize: "vertical", width: "100%" }}
                />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={() => { setAddingEvent(false); setNewEventTitle(""); setNewEventNote(""); setNewEventDate(""); }} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                  <button onClick={addEvent} disabled={!newEventTitle.trim()} style={{ background: "var(--electric)", border: "none", color: "white", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", opacity: newEventTitle.trim() ? 1 : 0.4 }}>Add</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingEvent(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: 8, padding: "8px 14px", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.15s", width: "100%", textAlign: "left" }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add business event
              </button>
            )}
          </div>

          {state.weeklyEvents.length > 0 && (
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
              {state.weeklyEvents.length} event{state.weeklyEvents.length !== 1 ? "s" : ""} will be included in generation
            </p>
          )}
        </div>

        {/* Generate row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Generations used this week</span>
              <span style={{ fontSize: 12, color: remaining < 5 ? "#FF8800" : "rgba(255,255,255,0.7)", fontWeight: 600 }}>
                {state.generationsUsed} / {state.generationsLimit}
              </span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(state.generationsUsed / state.generationsLimit) * 100}%`, background: remaining < 5 ? "#FF8800" : "var(--electric)", borderRadius: 2, transition: "width 0.3s" }} />
            </div>
            {remaining < 5 && remaining > 0 && (
              <p style={{ fontSize: 11, color: "#FF8800", marginTop: 4 }}>⚠ Only {remaining} generations remaining</p>
            )}
          </div>

          <button className="btn-primary" onClick={handleGenerate} disabled={loading || !canGenerate} style={{ flexShrink: 0 }}>
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
