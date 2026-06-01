import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/AppContext";

const BRAND_PALETTE = [
  { name: "Indigo Ink",      hex: "#380A65" },
  { name: "Twilight Indigo", hex: "#1B2D52" },
  { name: "Electric Indigo", hex: "#6C00FF" },
  { name: "Bright Indigo",   hex: "#0033FF" },
];

const TONE_ORDER = ["Direct","Professional","Personal","Warm","Educational","Philosophical","Inspirational","Salesy","Playful","Urgent"];

export default function VoiceGuide() {
  const { state } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const vg = state.voiceGuide;

  const copyHex = (hex) => {
    navigator.clipboard.writeText(hex).then(() => showToast(`Copied ${hex}`));
  };

  const pillars = [vg.pillar1, vg.pillar2, vg.pillar3, vg.pillar4].filter(Boolean);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, gap: 16, flexWrap: "wrap" }}>
        <div>
          <span className="label-eyebrow">Voice Guide</span>
          <h2 style={{ color: "var(--ink)", marginTop: 6 }}>{vg.brandName}</h2>
        </div>
        <button className="btn-ghost" onClick={() => navigate("/onboarding")} style={{ fontSize: 13, padding: "9px 18px" }}>
          ✎ Edit Guide
        </button>
      </div>

      {/* Positioning statement */}
      <div className="card-dark" style={{ marginBottom: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(108,0,255,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
        <span className="label-eyebrow" style={{ color: "rgba(255,255,255,0.4)" }}>Positioning Statement</span>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontStyle: "italic", fontSize: 20, color: "white", lineHeight: 1.5, marginTop: 12, position: "relative", zIndex: 1 }}>
          "{vg.positioning}"
        </p>
      </div>

      {/* Tone profile */}
      <div className="card" style={{ marginBottom: 20 }}>
        <span className="label-eyebrow" style={{ display: "block", marginBottom: 16 }}>Tone Profile</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {TONE_ORDER.map(key => {
            const val = vg.toneSliders?.[key] ?? 5;
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 13, color: "var(--twilight)", width: 120, flexShrink: 0 }}>{key}</span>
                <div style={{ flex: 1, height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${val * 10}%`, background: "var(--electric)", borderRadius: 3, transition: "width 0.4s ease" }} />
                </div>
                <span style={{ fontSize: 12, color: "var(--electric)", fontWeight: 600, width: 20, textAlign: "right" }}>{val}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sound like / not sound like */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div className="card">
          <span className="label-eyebrow" style={{ display: "block", marginBottom: 12, color: "#00A550" }}>Sounds Like</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(vg.soundLike || []).map(tag => (
              <span key={tag} style={{ padding: "5px 13px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: "rgba(0,180,80,0.08)", color: "#00A550", border: "1px solid rgba(0,180,80,0.2)" }}>{tag}</span>
            ))}
          </div>
        </div>
        <div className="card">
          <span className="label-eyebrow" style={{ display: "block", marginBottom: 12, color: "#CC2200" }}>Never Sounds Like</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(vg.notSoundLike || []).map(tag => (
              <span key={tag} style={{ padding: "5px 13px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: "rgba(200,0,0,0.06)", color: "#CC2200", border: "1px solid rgba(200,0,0,0.15)" }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Messaging pillars */}
      <div className="card" style={{ marginBottom: 20 }}>
        <span className="label-eyebrow" style={{ display: "block", marginBottom: 16 }}>Messaging Pillars</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {pillars.map((p, i) => (
            <div key={i} style={{ background: "var(--off-white)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--border)" }}>
              <span className="label-eyebrow" style={{ color: "var(--electric)", marginBottom: 6, display: "block" }}>Pillar {i + 1}</span>
              <p style={{ fontSize: 13, color: "var(--twilight)", lineHeight: 1.6, margin: 0 }}>{p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Words to avoid / reach for */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div className="card">
          <span className="label-eyebrow" style={{ display: "block", marginBottom: 12, color: "#CC2200" }}>Avoid</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(vg.avoidWords || "").split(",").map(w => w.trim()).filter(Boolean).map(w => (
              <span key={w} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, background: "rgba(200,0,0,0.06)", color: "#CC2200", border: "1px solid rgba(200,0,0,0.15)" }}>{w}</span>
            ))}
          </div>
        </div>
        <div className="card">
          <span className="label-eyebrow" style={{ display: "block", marginBottom: 12, color: "var(--electric)" }}>Reach For</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(vg.reachWords || "").split(",").map(w => w.trim()).filter(Boolean).map(w => (
              <span key={w} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, background: "rgba(108,0,255,0.07)", color: "var(--electric)", border: "1px solid rgba(108,0,255,0.15)" }}>{w}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Brand palette */}
      <div className="card" style={{ marginBottom: 20 }}>
        <span className="label-eyebrow" style={{ display: "block", marginBottom: 16 }}>Brand Palette</span>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {BRAND_PALETTE.map(c => (
            <button
              key={c.hex}
              onClick={() => copyHex(c.hex)}
              title={`Click to copy ${c.hex}`}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: 0,
                display: "flex", flexDirection: "column", gap: 8, alignItems: "center",
              }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 12, background: c.hex, border: "1px solid var(--border)" }} />
              <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>{c.name}</span>
              <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>{c.hex}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bio & CTAs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {[
          { label: "Bio / Tagline", value: vg.bio },
          { label: "Soft CTAs", value: vg.softCTAs },
          { label: "Conversion CTAs", value: vg.conversionCTAs },
        ].map(item => (
          <div key={item.label} className="card">
            <span className="label-eyebrow" style={{ display: "block", marginBottom: 10 }}>{item.label}</span>
            <p style={{ fontSize: 13, color: "var(--twilight)", lineHeight: 1.6, margin: 0 }}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
