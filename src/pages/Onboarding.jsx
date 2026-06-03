import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, useToast } from "../context/AppContext";
import { scrapeAndFillVoiceGuide } from "../lib/anthropic";

const SECTIONS = ["Scan Site","Brand Core","Positioning","Audience","Voice","Pillars","Content","Words","Bio & CTAs"];

const SOUND_LIKE_OPTIONS = ["Knowledgeable","Direct","Confident","Sharp","Witty","Warm","Empathetic","Playful","Authoritative","Humble","Bold","Clear"];
const NOT_SOUND_LIKE_OPTIONS = ["A guru","A hype machine","A motivational poster","A salesperson","A life coach","Corporate","Vague","Preachy"];
const TONE_KEYS = ["Direct","Professional","Personal","Warm","Educational","Philosophical","Inspirational","Salesy","Playful","Urgent"];

function TextInput({ value, onChange, placeholder }) {
  return <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || ""} />;
}
function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || ""} rows={rows} />;
}

const CONFIDENCE_STYLES = {
  high:     { bg: "rgba(0,165,80,0.08)",    color: "#007040", label: "✓ Confirmed" },
  inferred: { bg: "rgba(224,160,32,0.12)",  color: "#9A6400", label: "~ Inferred — review" },
  missing:  { bg: "rgba(150,150,150,0.08)", color: "var(--muted)", label: "○ Not found" },
};

function ConfidenceBadge({ confidence }) {
  if (!confidence) return null;
  const s = CONFIDENCE_STYLES[confidence] || CONFIDENCE_STYLES.missing;
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 8, background: s.bg, color: s.color, marginLeft: 8 }}>
      {s.label}
    </span>
  );
}

function QuizCard({ label, question, confidence, children }) {
  return (
    <div className="card" style={{ marginBottom: 14, borderColor: confidence === "missing" ? "var(--border)" : confidence === "high" ? "rgba(0,165,80,0.25)" : confidence === "inferred" ? "rgba(224,160,32,0.3)" : "var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <span className="label-eyebrow">{label}</span>
        <ConfidenceBadge confidence={confidence} />
      </div>
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
  const [confidence, setConfidence] = useState({});

  // Website scanner state
  const [siteUrl, setSiteUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);

  const handleScan = async () => {
    if (!siteUrl.trim()) return;
    setScanning(true);
    try {
      const url = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
      const result = await scrapeAndFillVoiceGuide(url);
      // result is { fieldName: { value, confidence } }
      const newForm = { ...form };
      const newConfidence = {};
      Object.entries(result).forEach(([key, data]) => {
        if (data.value !== undefined && data.value !== "" && data.value !== null) {
          newForm[key] = data.value;
        }
        if (data.confidence) newConfidence[key] = data.confidence;
      });
      setForm(newForm);
      setConfidence(newConfidence);
      setScanDone(true);
      showToast("Site scanned — review and edit each section.");
      setActiveSection(1); // jump to first real section
    } catch (err) {
      showToast(err.message || "Scan failed. Check the URL and try again.", "error");
    } finally {
      setScanning(false);
    }
  };

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

      {/* Section 0: Website Scanner */}
      {activeSection === 0 && (
        <div className="animate-fade-in-up">
          <div className="card-dark" style={{ marginBottom: 20, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(108,0,255,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <span className="label-eyebrow" style={{ color: "rgba(255,255,255,0.45)" }}>Optional — saves you time</span>
              <h3 style={{ color: "white", margin: "8px 0 10px" }}>Have an existing website?</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 20, lineHeight: 1.6 }}>
                Drop your URL and the AI will read your site and pre-fill the guide as best it can.
                You'll review and fix anything that's off.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="text"
                  value={siteUrl}
                  onChange={e => setSiteUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleScan()}
                  placeholder="yoursite.com"
                  style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", flex: 1 }}
                />
                <button className="btn-primary" onClick={handleScan} disabled={scanning || !siteUrl.trim()} style={{ flexShrink: 0 }}>
                  {scanning ? "Scanning…" : "Scan my site"}
                </button>
              </div>
              {scanDone && (
                <p style={{ fontSize: 12, color: "rgba(150,255,150,0.8)", marginTop: 12 }}>
                  ✓ Guide pre-filled — step through the sections and edit anything that needs fixing.
                </p>
              )}
            </div>
          </div>

          <div className="card" style={{ textAlign: "center", padding: "24px 20px" }}>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 16 }}>No website, or prefer to fill it in manually?</p>
            <button className="btn-ghost" onClick={() => setActiveSection(1)}>Fill in manually →</button>
          </div>
        </div>
      )}

      {/* Section 1: Brand Core */}
      {activeSection === 1 && (
        <div className="animate-fade-in-up">
          <QuizCard label="Q1 · Brand Core" question="What is the name of the business or personal brand?" confidence={confidence.brandName}>
            <TextInput value={form.brandName || ""} onChange={set("brandName")} placeholder="e.g. The Ikigai Project" />
          </QuizCard>
          <QuizCard label="Q2 · Brand Core" question="Beyond the product, what are you really selling?" confidence={confidence.reallySelling}>
            <TextArea value={form.reallySelling || ""} onChange={set("reallySelling")} placeholder="The deeper value, the transformation, the feeling…" />
          </QuizCard>
          <QuizCard label="Q3 · Brand Core" question="In one sentence, what do you actually deliver for clients?" confidence={confidence.delivers}>
            <TextInput value={form.delivers || ""} onChange={set("delivers")} placeholder="Business growth and infrastructure systems for…" />
          </QuizCard>
          <QuizCard label="Q4 · Brand Core" question="What are you explicitly NOT selling?" confidence={confidence.notSelling}>
            <TextArea value={form.notSelling || ""} onChange={set("notSelling")} placeholder="Not hustle culture. No results-guarantee hype…" />
          </QuizCard>
          <QuizCard label="Q5 · Brand Core" question="When someone finishes working with you, how should they feel?" confidence={confidence.clientFeeling}>
            <TextArea value={form.clientFeeling || ""} onChange={set("clientFeeling")} placeholder="Informed. Safe. Clear-headed…" />
          </QuizCard>
        </div>
      )}

      {/* Section 2: Positioning */}
      {activeSection === 2 && (
        <div className="animate-fade-in-up">
          <QuizCard label="Q6 · Positioning" question="Write your core positioning statement in one sentence." confidence={confidence.positioning}>
            <TextArea value={form.positioning || ""} onChange={set("positioning")} rows={2} />
          </QuizCard>
          <QuizCard label="Q7 · Positioning" question="What is the single biggest differentiator from competitors?" confidence={confidence.differentiator}>
            <TextArea value={form.differentiator || ""} onChange={set("differentiator")} />
          </QuizCard>
        </div>
      )}

      {/* Section 3: Audience */}
      {activeSection === 3 && (
        <div className="animate-fade-in-up">
          <QuizCard label="Q8 · Audience" question="Who is the primary audience for this brand?" confidence={confidence.audience}>
            <TextArea value={form.audience || ""} onChange={set("audience")} />
          </QuizCard>
          <QuizCard label="Q9 · Audience" question="What does your audience care about most when choosing you?" confidence={confidence.audienceCares}>
            <TextArea value={form.audienceCares || ""} onChange={set("audienceCares")} />
          </QuizCard>
          <QuizCard label="Q10 · Audience" question="Who is this brand NOT for?" confidence={confidence.notFor}>
            <TextArea value={form.notFor || ""} onChange={set("notFor")} />
          </QuizCard>
        </div>
      )}

      {/* Section 4: Voice */}
      {activeSection === 4 && (
        <div className="animate-fade-in-up">
          <QuizCard label="Q11 · Brand Voice" question="Rate your brand's voice on each dimension (0–10)." confidence={confidence.toneSliders}>
            <ToneSliders value={form.toneSliders || {}} onChange={set("toneSliders")} />
          </QuizCard>
          <QuizCard label="Q12 · Brand Voice" question="Your brand should sound like…" confidence={confidence.soundLike}>
            <MultiChips options={SOUND_LIKE_OPTIONS} selected={form.soundLike || []} onToggle={toggleChip("soundLike")} />
          </QuizCard>
          <QuizCard label="Q13 · Brand Voice" question="Your brand should NOT sound like…" confidence={confidence.notSoundLike}>
            <MultiChips options={NOT_SOUND_LIKE_OPTIONS} selected={form.notSoundLike || []} onToggle={toggleChip("notSoundLike")} />
          </QuizCard>
          <QuizCard label="Q14 · Brand Voice" question="What are your 3–5 core voice rules?" confidence={confidence.voiceRules}>
            <TextArea value={form.voiceRules || ""} onChange={set("voiceRules")} rows={4} placeholder="e.g. Simplify what seems complex. Speak bitter truths calmly…" />
          </QuizCard>
        </div>
      )}

      {/* Section 5: Pillars */}
      {activeSection === 5 && (
        <div className="animate-fade-in-up">
          {[
            { key: "pillar1", q: "First core message theme — and why it matters", label: "Q15 · Pillar 1" },
            { key: "pillar2", q: "Second core message theme", label: "Q16 · Pillar 2" },
            { key: "pillar3", q: "Third core message theme", label: "Q17 · Pillar 3" },
            { key: "pillar4", q: "Fourth core message theme (optional)", label: "Q18 · Pillar 4" },
          ].map(item => (
            <QuizCard key={item.key} label={item.label} question={item.q} confidence={confidence[item.key]}>
              <TextArea value={form[item.key] || ""} onChange={set(item.key)} />
            </QuizCard>
          ))}
        </div>
      )}

      {/* Section 6: Content */}
      {activeSection === 6 && (
        <div className="animate-fade-in-up">
          <QuizCard label="Q19 · Content Identity" question="What are the main content buckets this brand will publish around?" confidence={confidence.contentBuckets}>
            <TextArea value={form.contentBuckets || ""} onChange={set("contentBuckets")} rows={4} placeholder="1. Demystifying business infrastructure…" />
          </QuizCard>
          <QuizCard label="Q20 · Content Identity" question="What is the one rule that keeps your content on-brand?" confidence={confidence.contentRule}>
            <TextInput value={form.contentRule || ""} onChange={set("contentRule")} placeholder="Say it directly, and say it calm…" />
          </QuizCard>
        </div>
      )}

      {/* Section 7: Words */}
      {activeSection === 7 && (
        <div className="animate-fade-in-up">
          <QuizCard label="Q21 · Words & Angles" question="Words, phrases, or angles this brand should NEVER use." confidence={confidence.avoidWords}>
            <TextArea value={form.avoidWords || ""} onChange={set("avoidWords")} placeholder="hustle, grind, guarantee, 10x…" />
          </QuizCard>
          <QuizCard label="Q22 · Words & Angles" question="Words or phrases to reach for instead." confidence={confidence.reachWords}>
            <TextArea value={form.reachWords || ""} onChange={set("reachWords")} placeholder="clarity, alignment, infrastructure, partnership…" />
          </QuizCard>
        </div>
      )}

      {/* Section 8: Bio & CTAs */}
      {activeSection === 8 && (
        <div className="animate-fade-in-up">
          <QuizCard label="Q23 · Bio & CTAs" question="Write a short public-facing bio or tagline." confidence={confidence.bio}>
            <TextArea value={form.bio || ""} onChange={set("bio")} rows={3} />
          </QuizCard>
          <QuizCard label="Q24 · Bio & CTAs" question="Soft trust CTAs — low-pressure invitations to connect." confidence={confidence.softCTAs}>
            <TextArea value={form.softCTAs || ""} onChange={set("softCTAs")} placeholder="If you're thinking about making the move…" />
          </QuizCard>
          <QuizCard label="Q25 · Bio & CTAs" question="Mid-conversion CTAs — when someone is closer to deciding." confidence={confidence.conversionCTAs}>
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
