import { useEffect } from "react";

export default function HelpPanel({ onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "flex-start", justifyContent: "flex-end",
        padding: "70px 24px 0",
        overflowY: "auto",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "rgba(42,26,10,0.97)",
          border: "1px solid rgba(255,140,66,0.2)",
          borderRadius: 14,
          padding: 24,
          width: "100%",
          maxWidth: 360,
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
          marginBottom: 24,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 17, color: "#FFD93D", fontWeight: 700 }}>
            Help & Guide
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#A89070", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>

        {/* Navigating the App */}
        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 12, color: "#FF8C42", letterSpacing: 1, fontWeight: 700, marginBottom: 10 }}>🏝️ NAVIGATING THE APP</p>
        <p style={{ color: "#C8B89A", fontSize: 14, lineHeight: 1.6, marginBottom: 6 }}>
          <strong style={{ color: "#E8D5B5" }}>Switching leagues</strong> — tap the league name in the top-left to open the league switcher. Select any league you belong to, or join/create a new one.
        </p>
        <p style={{ color: "#C8B89A", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          <strong style={{ color: "#E8D5B5" }}>Your account</strong> — click your name or avatar in the top-right to update your display name and avatar.
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,140,66,0.1)", marginBottom: 20 }} />

        {/* Spoiler Filter */}
        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 12, color: "#FF8C42", letterSpacing: 1, fontWeight: 700, marginBottom: 10 }}>👁️ SPOILER FILTER</p>
        <p style={{ color: "#C8B89A", fontSize: 14, lineHeight: 1.6, marginBottom: 6 }}>
          The 👁 dropdown in the header controls how much of the season you've seen. Set it to the last episode you watched and all scores, eliminations, and events beyond that point will be hidden.
        </p>
        <p style={{ color: "#C8B89A", fontSize: 14, lineHeight: 1.6 }}>
          <strong style={{ color: "#E8D5B5" }}>Last Episode Watched</strong> — hides everything. Use this if you haven't started yet.<br/>
          <strong style={{ color: "#E8D5B5" }}>Ep 1–14</strong> — shows only up to that episode.<br/>
          <strong style={{ color: "#E8D5B5" }}>All caught up</strong> — no filter, shows everything.
        </p>
      </div>
    </div>
  );
}
