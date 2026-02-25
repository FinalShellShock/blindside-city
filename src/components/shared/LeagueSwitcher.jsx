import { useState } from "react";
import { useLeague } from "../../contexts/LeagueContext.jsx";

export default function LeagueSwitcher({ currentUser, displayName }) {
  const { appState, currentLeagueId, setCurrentLeagueId, userLeagues } = useLeague();
  const [open, setOpen] = useState(false);

  const leagueName = appState?.leagueName || "League";

  // Build list: known leagues from userLeagues + always include current
  const knownLeagues = userLeagues.length > 0
    ? userLeagues
    : [{ id: currentLeagueId, name: leagueName, role: "member" }];

  // Ensure current league is represented (may not be in userLeagues for legacy users)
  const hasCurrentInList = knownLeagues.some(l => l.id === currentLeagueId);
  const leagueList = hasCurrentInList
    ? knownLeagues
    : [{ id: currentLeagueId, name: leagueName, role: "member" }, ...knownLeagues];

  if (leagueList.length <= 1) {
    // Single league — just show the name, no switcher needed
    return (
      <h1 style={{
        fontFamily: "'Cinzel',serif",
        fontSize: 18,
        fontWeight: 700,
        color: "#FF8C42",
        margin: 0,
        letterSpacing: 1,
      }}>
        {leagueName}
      </h1>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: 0,
        }}
      >
        <h1 style={{
          fontFamily: "'Cinzel',serif",
          fontSize: 18,
          fontWeight: 700,
          color: "#FF8C42",
          margin: 0,
          letterSpacing: 1,
        }}>
          {leagueName}
        </h1>
        <span style={{ color: "#A89070", fontSize: 12 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          left: 0,
          background: "#1C1008",
          border: "1px solid rgba(255,140,66,0.25)",
          borderRadius: 8,
          minWidth: 200,
          zIndex: 100,
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
        }}>
          {leagueList.map(league => (
            <button
              key={league.id}
              onClick={() => { setCurrentLeagueId(league.id); setOpen(false); }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: league.id === currentLeagueId ? "rgba(255,140,66,0.12)" : "transparent",
                border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                padding: "10px 14px",
                cursor: "pointer",
                color: league.id === currentLeagueId ? "#FF8C42" : "#E8D5B5",
                fontFamily: "'Crimson Pro',serif",
                fontSize: 15,
              }}
            >
              {league.name}
              {league.id === currentLeagueId && (
                <span style={{ fontSize: 11, color: "#A89070", marginLeft: 6 }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
