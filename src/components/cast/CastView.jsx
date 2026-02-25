import { useState } from "react";
import { S } from "../../styles/theme.js";
import { useLeague } from "../../contexts/LeagueContext.jsx";
import Portrait from "../shared/Portrait.jsx";
import { SkullIcon } from "../shared/Icons.jsx";

const MERGED_COLOR = "#FFD93D";
function tribeColor(tribeColors, tribe) {
  if (tribe === "Merged") return MERGED_COLOR;
  return tribeColors[tribe] || "#666";
}
function normEliminated(eliminated) {
  return (eliminated || []).map(e => typeof e === "string" ? { name: e, episode: null } : e);
}
function isElim(eliminated, name) {
  return normEliminated(eliminated).some(e => e.name === name);
}
function elimEpisode(eliminated, name) {
  return normEliminated(eliminated).find(e => e.name === name)?.episode || null;
}

export default function CastView() {
  const { appState, contestantScores, eliminated, tribeOverrides, getEffectiveTribe, contestants, tribeColors } = useLeague();
  const [expandedCast, setExpandedCast] = useState(null);

  return (
    <div>
      <div style={S.card}>
        <h2 style={S.cardTitle}>All Contestants</h2>
        <p style={{ color: "#A89070", fontSize: 13, marginBottom: 16 }}>Sorted by points · tap a player to see their scoring breakdown</p>
        <div style={{ display: "grid", gap: 6 }}>
          {[...contestants].sort((a, b) => (contestantScores[b.name]?.total || 0) - (contestantScores[a.name]?.total || 0)).map((c, i) => {
            const isE = isElim(eliminated, c.name);
            const owner = Object.entries(appState.teams || {}).find(([_, t]) => t.members.includes(c.name));
            const score = contestantScores[c.name]?.total || 0;
            const events = contestantScores[c.name]?.events || [];
            const isExpanded = expandedCast === c.name;
            const currentTribe = getEffectiveTribe(c.name);
            const tribeChanged = tribeOverrides[c.name] && tribeOverrides[c.name] !== c.tribe;
            const epNum = elimEpisode(eliminated, c.name);
            return (
              <div key={c.name}>
                <div onClick={() => setExpandedCast(isExpanded ? null : c.name)} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderRadius: 8,
                  background: isExpanded ? "rgba(255,140,66,0.08)" : "rgba(255,255,255,0.02)",
                  cursor: "pointer", borderLeft: `3px solid ${tribeColor(tribeColors, currentTribe)}`,
                  opacity: isE ? 0.55 : 1, transition: "background 0.15s",
                }}>
                  <span style={{ color: "#A89070", fontFamily: "'Cinzel',serif", fontWeight: 600, width: 26, fontSize: 13, textAlign: "center" }}>{i + 1}</span>
                  <Portrait slug={c.slug} tribe={currentTribe} size={36} eliminated={isE} tribeColors={tribeColors}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ color: "#E8D5B5", fontWeight: 600, fontSize: 15, textDecoration: isE ? "line-through" : "none" }}>{c.name}</span>
                      {isE && <SkullIcon size={12}/>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 3, background: tribeColor(tribeColors, currentTribe) + "22", color: tribeColor(tribeColors, currentTribe), fontWeight: 600 }}>{currentTribe}</span>
                      {tribeChanged && <span style={{ fontSize: 11, color: "#A89070", textDecoration: "line-through" }}>{c.tribe}</span>}
                      {isE && epNum && <span style={{ fontSize: 11, color: "#F87171" }}>· Elim. Ep {epNum}</span>}
                      {owner && <span style={{ fontSize: 11, color: "#A89070" }}>· {owner[0]}</span>}
                    </div>
                  </div>
                  <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 20, color: score > 0 ? "#FF8C42" : "#A89070", minWidth: 40, textAlign: "right" }}>{score}</span>
                  <span style={{ color: "#A89070", fontSize: 11, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
                </div>
                {isExpanded && (
                  <div style={{ marginLeft: 29, padding: "12px 16px", background: "rgba(42,26,10,0.4)", borderRadius: "0 0 8px 8px", borderLeft: `3px solid ${tribeColor(tribeColors, currentTribe)}` }}>
                    {events.length > 0 ? (() => {
                      const byEp = {};
                      events.forEach(ev => {
                        if (!byEp[ev.episode]) byEp[ev.episode] = [];
                        byEp[ev.episode].push(ev);
                      });
                      return Object.entries(byEp).sort((a, b) => Number(b[0]) - Number(a[0])).map(([ep, evts]) => (
                        <div key={ep} style={{ marginBottom: 12 }}>
                          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 12, fontWeight: 700, color: "#FF8C42", marginBottom: 4, letterSpacing: 1 }}>Episode {ep}</p>
                          {evts.map((ev, j) => (
                            <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px", marginBottom: 2, borderRadius: 4, background: "rgba(255,255,255,0.02)" }}>
                              <span style={{ color: "#E8D5B5", fontSize: 13 }}>{ev.label}</span>
                              <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 13, color: ev.points >= 0 ? "#4ADE80" : "#F87171" }}>{ev.points > 0 ? "+" : ""}{ev.points}</span>
                            </div>
                          ))}
                        </div>
                      ));
                    })() : <p style={{ color: "#A89070", fontSize: 13, fontStyle: "italic" }}>No scoring events yet.</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
