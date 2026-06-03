import { useRef, useState } from "react";
import { useApp, useToast } from "../context/AppContext";
import { ASSET_TYPES } from "../lib/mockData";

const TYPE_COLOURS = {
  Logo:       { bg: "rgba(108,0,255,0.08)",  color: "var(--electric)" },
  Face:       { bg: "rgba(0,100,220,0.08)",  color: "#0064DC" },
  Mascot:     { bg: "rgba(0,160,80,0.08)",   color: "#00A050" },
  "Style Ref":{ bg: "rgba(200,120,0,0.08)",  color: "#C87800" },
  Product:    { bg: "rgba(180,0,60,0.08)",   color: "#B4003C" },
};

function AssetCard({ asset, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(asset.label);
  const [type, setType] = useState(asset.type);
  const [usageNote, setUsageNote] = useState(asset.usageNote || "");
  const tc = TYPE_COLOURS[asset.type] || TYPE_COLOURS["Style Ref"];

  const save = () => {
    onUpdate({ ...asset, label, type, usageNote });
    setEditing(false);
  };

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Thumbnail */}
      <div style={{
        height: 140, background: "var(--off-white)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
        overflow: "hidden",
      }}>
        {asset.dataUrl ? (
          <img src={asset.dataUrl} alt={asset.label} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 12 }} />
        ) : (
          <span style={{ fontSize: 36, opacity: 0.3 }}>📁</span>
        )}
        <div style={{ position: "absolute", top: 8, right: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 10, ...tc }}>
            {asset.type}
          </span>
        </div>
      </div>

      <div style={{ padding: "14px 16px" }}>
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="Label" style={{ fontSize: 13 }} />
            <select value={type} onChange={e => setType(e.target.value)} style={{ fontSize: 13 }}>
              {ASSET_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <textarea value={usageNote} onChange={e => setUsageNote(e.target.value)} placeholder="Usage note for AI (optional)" rows={2} style={{ fontSize: 12, resize: "none" }} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn-ghost" onClick={() => setEditing(false)} style={{ padding: "6px 14px", fontSize: 12 }}>Cancel</button>
              <button className="btn-primary" onClick={save} style={{ padding: "6px 14px", fontSize: 12 }}>Save</button>
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>{asset.label}</p>
            {asset.usageNote && <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, marginBottom: 8 }}>{asset.usageNote}</p>}
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn-ghost" onClick={() => setEditing(true)} style={{ flex: 1, fontSize: 11, padding: "6px 10px", justifyContent: "center" }}>✎ Edit</button>
              <button onClick={() => onDelete(asset.id)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "var(--muted)", cursor: "pointer", fontFamily: "inherit" }}>✕</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Assets() {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const fileInputRef = useRef();
  const [filter, setFilter] = useState("All");
  const [dragging, setDragging] = useState(false);

  const assets = state.assets || [];
  const filtered = filter === "All" ? assets : assets.filter(a => a.type === filter);

  const processFiles = (files) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        showToast(`${file.name} — only images and videos supported.`, "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        dispatch({
          type: "ADD_ASSET",
          payload: {
            id: `asset-${Date.now()}-${Math.random()}`,
            label: file.name.replace(/\.[^.]+$/, ""),
            type: guessType(file.name),
            usageNote: "",
            dataUrl: e.target.result,
            fileName: file.name,
          },
        });
      };
      reader.readAsDataURL(file);
    });
    showToast("Asset added to library.");
  };

  const guessType = (name) => {
    const n = name.toLowerCase();
    if (n.includes("logo")) return "Logo";
    if (n.includes("face") || n.includes("headshot") || n.includes("portrait") || n.includes("photo")) return "Face";
    if (n.includes("mascot") || n.includes("character")) return "Mascot";
    if (n.includes("product")) return "Product";
    return "Style Ref";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="label-eyebrow">Asset Library</span>
          <h2 style={{ color: "var(--ink)", marginTop: 6 }}>Brand Assets</h2>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
            Logos, faces, mascots and style references — used by the AI when generating visuals.
          </p>
        </div>
        <button className="btn-primary" onClick={() => fileInputRef.current?.click()}>
          + Upload asset
        </button>
        <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" style={{ display: "none" }} onChange={e => processFiles(e.target.files)} />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? "var(--electric)" : "var(--border)"}`,
          borderRadius: 14, padding: "28px 20px", textAlign: "center",
          marginBottom: 28, transition: "all 0.15s",
          background: dragging ? "rgba(108,0,255,0.04)" : "transparent",
        }}
      >
        <p style={{ fontSize: 14, color: dragging ? "var(--electric)" : "var(--muted)", fontWeight: 500 }}>
          {dragging ? "Drop to upload" : "Drag & drop images or videos here"}
        </p>
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
          Logos · Faces · Mascots · Style references · Product shots
        </p>
      </div>

      {/* How the AI uses these */}
      <div className="card" style={{ marginBottom: 28, background: "rgba(108,0,255,0.04)", borderColor: "rgba(108,0,255,0.15)" }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { icon: "✦", label: "Claude", desc: "Reads your asset library when writing visual briefs — picks the right refs per post type" },
            { icon: "🖼", label: "Nano Banana", desc: "Uses logos, faces, and style refs to keep static images visually on-brand" },
            { icon: "🎬", label: "Veo 3", desc: "Uses face and mascot refs for character consistency across video and reel content" },
          ].map(item => (
            <div key={item.label} style={{ flex: "1 1 200px", display: "flex", gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", marginBottom: 2 }}>{item.label}</p>
                <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {["All", ...ASSET_TYPES].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
              cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.15s",
              border: filter === t ? "1px solid var(--electric)" : "1px solid var(--border)",
              background: filter === t ? "rgba(108,0,255,0.08)" : "transparent",
              color: filter === t ? "var(--electric)" : "var(--muted)",
            }}
          >
            {t}
            {t !== "All" && (
              <span style={{ marginLeft: 6, opacity: 0.6 }}>
                {assets.filter(a => a.type === t).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Asset grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>
            {filter === "All" ? "No assets yet — upload your first one above." : `No ${filter} assets yet.`}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {filtered.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onUpdate={payload => dispatch({ type: "UPDATE_ASSET", payload })}
              onDelete={id => { dispatch({ type: "DELETE_ASSET", payload: id }); showToast("Asset removed."); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
