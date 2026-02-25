import { useState } from "react";
import { getPortraitUrl, TRIBE_COLORS } from "../../gameData.js";

const MERGED_COLOR = "#FFD93D";

function tribeColor(tribeColors, tribe) {
  if (tribe === "Merged") return MERGED_COLOR;
  return tribeColors[tribe] || "#666";
}

// tribeColors prop accepts the league's tribeColors map; falls back to game defaults
// so existing callers that don't pass it continue to work.
export default function Portrait({ slug, tribe, size = 36, eliminated = false, tribeColors = TRIBE_COLORS }) {
  const [failed, setFailed] = useState(false);
  if (failed || !slug) {
    const initial = (slug || "?").charAt(0).toUpperCase();
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%", background: tribeColor(tribeColors, tribe),
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontFamily: "'Cinzel',serif", fontWeight: 700,
        fontSize: size * 0.4, flexShrink: 0, opacity: eliminated ? 0.4 : 1,
        border: `2px solid ${tribeColor(tribeColors, tribe)}`,
      }}>
        {initial}
      </div>
    );
  }
  return (
    <img
      src={getPortraitUrl(slug)}
      alt={slug}
      onError={() => setFailed(true)}
      style={{
        width: size, height: size, borderRadius: "50%", objectFit: "cover",
        flexShrink: 0, opacity: eliminated ? 0.4 : 1,
        border: `2px solid ${tribeColor(tribeColors, tribe)}`,
        filter: eliminated ? "grayscale(100%)" : "none",
      }}
    />
  );
}
