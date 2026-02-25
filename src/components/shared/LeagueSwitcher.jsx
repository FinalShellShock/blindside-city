import { useState, useEffect, useRef } from "react";
import { useLeague } from "../../contexts/LeagueContext.jsx";

export default function LeagueSwitcher({ onJoinCreate }) {
  const { appState, currentLeagueId, setCurrentLeagueId, userLeagues } = useLeague();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const leagueName = appState?.leagueName || "League";

  // Build list: known leagues from userLeagues + always include current
  const knownLeagues = userLeagues.length > 0
    ? userLeagues
    : [{ id: currentLeagueId, name: leagueName, role: "member" }];

  const hasCurrentInList = knownLeagues.some(l => l.id === currentLeagueId);
  const leagueList = hasCurrentInList
    ? knownLeagues
    : [{ id: currentLeagueId, name: leagueName, role: "member" }, ...knownLeagues];

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: open ? "rgba(255,140,66,0.08)" : "transparent",
          border: open ? "1px solid rgba(255,140,66,0.35)" : "1px solid transparent",
          borderBottom: open ? "1px solid transparent" : "1px solid transparent",
          borderRadius: open ? "8px 8px 0 0" : 8,
          cursor: "pointer",
          padding: "5px 10px 5px 8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 1,
          transition: "background 0.15s, border-color 0.15s",
        }}
      >
        <span style={{
          fontFamily: "'Cinzel',serif",
          fontSize: 10,
          letterSpacing: 2,
          color: "#A89070",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}>
          League <span style={{ fontSize: 9, color: open ? "#FF8C42" : "#A89070", transition: "transform 0.15s, color 0.15s", display: "inline-block", transform: open ? "rotate(180deg)" : "none" }}>▾</span>
        </span>
        <span style={{
          fontFamily: "'Cinzel',serif",
          fontSize: 17,
          fontWeight: 700,
          color: "#FF8C42",
          letterSpacing: 1,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
        }}>
          {leagueName}
        </span>
      </button>

      {/* Dropdown — flush below trigger, matching border */}
      {open && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          minWidth: "100%",
          background: "rgba(28,16,8,0.98)",
          border: "1px solid rgba(255,140,66,0.35)",
          borderTop: "1px solid rgba(255,140,66,0.15)",
          borderRadius: "0 0 8px 8px",
          zIndex: 100,
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.7)",
        }}>
          {leagueList.map((league, i) => (
            <button
              key={league.id}
              onClick={() => { setCurrentLeagueId(league.id); setOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                textAlign: "left",
                background: league.id === currentLeagueId ? "rgba(255,140,66,0.1)" : "transparent",
                border: "none",
                borderBottom: i < leagueList.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                padding: "10px 14px",
                cursor: "pointer",
                color: league.id === currentLeagueId ? "#FF8C42" : "#E8D5B5",
                fontFamily: "'Crimson Pro',serif",
                fontSize: 15,
                gap: 12,
                whiteSpace: "nowrap",
              }}
            >
              <span>{league.name}</span>
              {league.id === currentLeagueId && (
                <span style={{ fontSize: 12, color: "#FF8C42" }}>✓</span>
              )}
            </button>
          ))}

          <button
            onClick={() => { onJoinCreate(); setOpen(false); }}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              background: "transparent",
              border: "none",
              borderTop: "1px solid rgba(255,140,66,0.2)",
              padding: "10px 14px",
              cursor: "pointer",
              color: "#FF8C42",
              fontFamily: "'Crimson Pro',serif",
              fontSize: 14,
              whiteSpace: "nowrap",
            }}
          >
            + Join or Create League
          </button>
        </div>
      )}
    </div>
  );
}
