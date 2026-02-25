import { useLeague } from "../../contexts/LeagueContext.jsx";

// Max episode number to offer in the selector.
// Once the season has more than 14 episodes we can bump this.
const MAX_EPISODE = 14;

export default function EpisodeSelector() {
  const { watchedThrough, setWatchedThrough } = useLeague();

  const label = watchedThrough === 0
    ? "Last Episode Watched"
    : watchedThrough === 999
    ? "All caught up"
    : `Watched Ep ${watchedThrough}`;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 11, color: "#A89070", fontFamily: "'Cinzel',serif", letterSpacing: 1, whiteSpace: "nowrap" }}>
        👁 Spoiler Filter:
      </span>
      <select
        value={watchedThrough}
        onChange={e => setWatchedThrough(parseInt(e.target.value, 10))}
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,140,66,0.25)",
          borderRadius: 6,
          color: "#E8D5B5",
          fontSize: 12,
          padding: "4px 6px",
          fontFamily: "'Crimson Pro',serif",
          cursor: "pointer",
          outline: "none",
        }}
      >
        <option value={0}>Last Episode Watched</option>
        {Array.from({ length: MAX_EPISODE }, (_, i) => i + 1).map(ep => (
          <option key={ep} value={ep}>Ep {ep}</option>
        ))}
        <option value={999}>All caught up</option>
      </select>
    </div>
  );
}
