import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, useToast } from "../context/AppContext";

const SECTIONS = ["Brand Core","Positioning","Audience","Voice","Pillars","Content","Words","Bio & CTAs"];

const SOUND_LIKE_OPTIONS = ["Knowledgeable","Direct","Confident","Sharp","Witty","Warm","Empathetic","Playful","Authoritative","Humble","Bold","Clear"];
const NOT_SOUND_LIKE_OPTIONS = ["A guru","A hype machine","A motivational poster","A salesperson","A life coach","Corporate","Vague","Preachy"];
const TONE_KEYS = ["Direct","Professional","Personal","Warm","Educational","Philosophical","Inspirational","Salesy","Playful","Urgent"];

function TextInput({ value, onChange, placeholder }) {
  return <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || ""} />;
}
function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || ""} rows={rows} />;
}

function QuizCard({ label, question, children }) {
  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <span className="label-eyebrow" style={{ display: "block", marginBottom: 8 }}>{label}</span>
      <p style={{ fontSize: 14, color: "var(--twilight)", marginBottom: 14, fontWeight: 500 }}>{question}</p>
      {children}
    </div>
  );
}

function ToneSliders({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {TONE_KEYS.map(key => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, width: 130, flexShrink: 0, color: "var(--twilight)" }}>{key}</span>
          <input
            type="range" min={0} max={10}
            value={value[key] ?? 5}
            onChange={e => onChange({ ...value, [key]: Number(e.target.value) })}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--electric)", width: 24, textAlign: "right" }}>
            {value[key] ?? 5}
          </span>
        </div>
      ))}
    </div>
  );
}

function MultiChips({ options, selected, onToggle }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(opt => (
        <span
          key={opt}
          className={`chip${selected.includes(opt) ? " selected" : ""}`}
          onClick={() => onToggle(opt)}
        >
          {opt}
        </span>
      ))}
    </div>
  );
}

export default function Onboarding() {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);

  const [form, setForm] = useState({ ...state.voiceGuide });

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));
  const toggleChip = (key) => (val) => {
    setForm(f => {
      const arr = f[key] || [];
      return { ...f, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
    });
  };

  const handleSubmit = () => {
    dispatch({ type: "SET_VOICE_GUIDE", payload: form });
    showToast("Voice guide saved. Generating your first posts…");
    navigate("/swipe");
  };

  const sectionRanges = [
    [0, 5],   // Brand Core: Q1–Q5
    [5, 7],   // Positioning: Q6–Q7
    [7, 10],  // Audience: Q8–Q10
    [10, 14], // Voice: Q11–Q14
    [14, 18], // Pillars: Q15–Q18
    [18, 20], // Content: Q19–Q20
    [20, 22], // Words: Q21–Q22
    [22, 25], // Bio & CTAs: Q23–Q25
  ];

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px 100px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <span className="label-eyebrow">Voice & Messaging Setup</span>
        <h2 style={{ color: "var(--ink)", marginTop: 6 }}>Build your brand voice guide</h2>
        <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 6 }}>Answer once. Powers every post we generate for you.</p>
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32, overflowX: "auto", paddingBottom: 4 }}>
        {SECTIONS.map((s, i) => (
          <button
            key={s}
            onClick={() => setActiveSection(i)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer", padding: "4px 8px", flexShrink: 0,
            }}
          >
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: i === activeSection ? "var(--electric)" : i < activeSection ? "var(--ink)" : "var(--border)",
              transition: "background 0.2s",
            }} />
            <span style={{ fontSize: 10, color: i === activeSection ? "var(--electric)" : "var(--muted)", fontWeight: i === activeSection ? 600 : 400, whiteSpace: "nowrap" }}>
              {s}
            </span>
          </button>
        ))}
      </div>

      {/* Section: Brand Core */}
      {activeSection === 0 && (
        <div className="animate-fade-in-up">
          <QuizCard label="Q1 · Brand Core" question="What is the name of the business or personal brand?">
            <TextInput value={form.brandName || ""} onChange={set("brandName")} placeholder="e.g. The Ikigai Project" />
          </QuizCard>
          <QuizCard label="Q2 · Brand Core" question="Beyond the product, what are you really selling?">
            <TextArea value={form.reallySelling || ""} onChange={set("reallySelling")} placeholder="The deeper value, the transformation, the feeling…" />
          </QuizCard>
          <QuizCard label="Q3 · Brand Core" question="In one sentence, what do you actually deliver for clients?">
            <TextInput value={form.delivers || ""} onChange={set("delivers")} placeholder="Business growth and infrastructure systems for…" />
          </QuizCard>
          <QuizCard label="Q4 · Brand Core" question="What are you explicitly NOT selling?">
            <TextArea value={form.notSelling || ""} onChange={set("notSelling")} placeholder="Not hustle culture. No results-guarantee hype…" />
          </QuizCard>
          <QuizCard label="Q5 · Brand Core" question="When someone finishes working with you, how should they feel?">
            <TextArea value={form.clientFeeling || ""} onChange={set("clientFeeling")} placeholder="Informed. Safe. Clear-headed…" />
          </QuizCard>
        </div>
      )}

      {/* Section: Positioning */}
      {activeSection === 1 && (
        <div className="animate-fade-in-up">
          <QuizCard label="Q6 · Positioning" question="Write your core positioning statement in one sentence.">
            <TextArea value={form.positioning || ""} onChange={set("positioning")} rows={2} />
          </QuizCard>
          <QuizCard label="Q7 · Positioning" question="What is the single biggest differentiator from competitors?">
            <TextArea value={form.differentiator || ""} onChange={set("differentiator")} />
          </QuizCard>
        </div>
      )}

      {/* Section: Audience */}
      {activeSection === 2 && (
        <div className="animate-fade-in-up">
          <QuizCard label="Q8 · Audience" question="Who is the primary audience for this brand?">
            <TextArea value={form.audience || ""} onChange={set("audience")} />
          </QuizCard>
          <QuizCard label="Q9 · Audience" question="What does your audience care about most when choosing you?">
            <TextArea value={form.audienceCares || ""} onChange={set("audienceCares")} />
          </QuizCard>
          <QuizCard label="Q10 · Audience" question="Who is this brand NOT for?">
            <TextArea value={form.notFor || ""} onChange={set("notFor")} />
          </QuizCard>
        </div>
      )}

      {/* Section: Voice */}
      {activeSection === 3 && (
        <div className="animate-fade-in-up">
          <QuizCard label="Q11 · Brand Voice" question="Rate your brand's voice on each dimension (0–10).">
            <ToneSliders value={form.toneSliders || {}} onChange={set("toneSliders")} />
          </QuizCard>
          <QuizCard label="Q12 · Brand Voice" question='Your brand should sound like…'>
            <MultiChips options={SOUND_LIKE_OPTIONS} selected={form.soundLike || []} onToggle={toggleChip("soundLike")} />
          </QuizCard>
          <QuizCard label="Q13 · Brand Voice" question='Your brand should NOT sound like…'>
            <MultiChips options={NOT_SOUND_LIKE_OPTIONS} selected={form.notSoundLike || []} onToggle={toggleChip("notSoundLike")} />
          </QuizCard>
          <QuizCard label="Q14 · Brand Voice" question="What are your 3–5 core voice rules?">
            <TextArea value={form.voiceRules || ""} onChange={set("voiceRules")} rows={4} placeholder="e.g. Simplify what seems complex. Speak bitter truths calmly…" />
          </QuizCard>
        </div>
      )}

      {/* Section: Pillars */}
      {activeSection === 4 && (
        <div className="animate-fade-in-up">
          {[
            { key: "pillar1", q: "First core message theme — and why it matters", label: "Q15 · Pillar 1" },
            { key: "pillar2", q: "Second core message theme", label: "Q16 · Pillar 2" },
            { key: "pillar3", q: "Third core message theme", label: "Q17 · Pillar 3" },
            { key: "pillar4", q: "Fourth core message theme (optional)", label: "Q18 · Pillar 4" },
          ].map(item => (
            <QuizCard key={item.key} label={item.label} question={item.q}>
              <TextArea value={form[item.key] || ""} onChange={set(item.key)} />
            </QuizCard>
          ))}
        </div>
      )}

      {/* Section: Content */}
      {activeSection === 5 && (
        <div className="animate-fade-in-up">
          <QuizCard label="Q19 · Content Identity" question="What are the main content buckets this brand will publish around?">
            <TextArea value={form.contentBuckets || ""} onChange={set("contentBuckets")} rows={4} placeholder="1. Demystifying business infrastructure…" />
          </QuizCard>
          <QuizCard label="Q20 · Content Identity" question="What is the one rule that keeps your content on-brand?">
            <TextInput value={form.contentRule || ""} onChange={set("contentRule")} placeholder="Say it directly, and say it calm…" />
          </QuizCard>
        </div>
      )}

      {/* Section: Words */}
      {activeSection === 6 && (
        <div className="animate-fade-in-up">
          <QuizCard label="Q21 · Words & Angles" question="Words, phrases, or angles this brand should NEVER use.">
            <TextArea value={form.avoidWords || ""} onChange={set("avoidWords")} placeholder="hustle, grind, guarantee, 10x…" />
          </QuizCard>
          <QuizCard label="Q22 · Words & Angles" question="Words or phrases to reach for instead.">
            <TextArea value={form.reachWords || ""} onChange={set("reachWords")} placeholder="clarity, alignment, infrastructure, partnership…" />
          </QuizCard>
        </div>
      )}

      {/* Section: Bio & CTAs */}
      {activeSection === 7 && (
        <div className="animate-fade-in-up">
          <QuizCard label="Q23 · Bio & CTAs" question="Write a short public-facing bio or tagline.">
            <TextArea value={form.bio || ""} onChange={set("bio")} rows={3} />
          </QuizCard>
          <QuizCard label="Q24 · Bio & CTAs" question="Soft trust CTAs — low-pressure invitations to connect.">
            <TextArea value={form.softCTAs || ""} onChange={set("softCTAs")} placeholder="If you're thinking about making the move…" />
          </QuizCard>
          <QuizCard label="Q25 · Bio & CTAs" question="Mid-conversion CTAs — when someone is closer to deciding.">
            <TextArea value={form.conversionCTAs || ""} onChange={set("conversionCTAs")} placeholder="Book a free strategy call. Explore our work…" />
          </QuizCard>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, gap: 12 }}>
        <button
          className="btn-ghost"
          onClick={() => setActiveSection(s => Math.max(0, s - 1))}
          disabled={activeSection === 0}
          style={{ padding: "12px 24px" }}
        >
          ← Back
        </button>

        {activeSection < SECTIONS.length - 1 ? (
          <button
            className="btn-primary"
            onClick={() => setActiveSection(s => s + 1)}
          >
            Next →
          </button>
        ) : (
          <button className="btn-primary" onClick={handleSubmit}>
            Save Voice Guide →
          </button>
        )}
      </div>
    </div>
  );
}
