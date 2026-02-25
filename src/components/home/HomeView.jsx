import { S } from "../../styles/theme.js";
import { CONTESTANTS, TRIBE_COLORS, SCORING_RULES } from "../../gameData.js";
import ReactionBar from "../shared/ReactionBar.jsx";

const MERGED_COLOR = "#FFD93D";
function tribeColor(tribe) {
  if (tribe === "Merged") return MERGED_COLOR;
  return TRIBE_COLORS[tribe] || "#666";
}

function normEliminated(eliminated) {
  return (eliminated || []).map(e => typeof e === "string" ? { name: e, episode: null } : e);
}

export default function HomeView({
  appState,
  currentUser,
  sortedTeams,
  feedEpisodes,
  myTeam,
  eliminated,
  addReaction,
  getEffectiveTribe,
}) {

  return (
    <div>
      {/* Commissioner announcement */}
      {appState.announcement && (
        <div style={{ ...S.card, borderColor: "rgba(255,217,61,0.2)", background: "rgba(255,217,61,0.05)", marginBottom: 20 }}>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 12, color: "#FFD93D", letterSpacing: 2, marginBottom: 6 }}>📣 COMMISSIONER MESSAGE</p>
          <p style={{ color: "#E8D5B5", fontSize: 15, lineHeight: 1.6 }}>{appState.announcement}</p>
        </div>
      )}

      {/* Standings */}
      <div style={S.card}>
        <h2 style={S.cardTitle}>Standings</h2>
        {sortedTeams.length > 0 ? sortedTeams.map(([name, data], i) => (
          <div key={name} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
            borderRadius: 8, marginBottom: 6,
            background: myTeam && myTeam[0] === name ? "rgba(255,107,53,0.1)" : "rgba(255,255,255,0.02)",
            borderLeft: i === 0 ? "3px solid #FFD93D" : i === 1 ? "3px solid #C0C0C0" : i === 2 ? "3px solid #CD7F32" : "3px solid transparent",
          }}>
            <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 16, color: i === 0 ? "#FFD93D" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#A89070", width: 28 }}>#{i + 1}</span>
            {appState.teams[name]?.logo
              ? <img src={appState.teams[name].logo} alt="logo" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,140,66,0.25)" }}/>
              : <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔥</div>
            }
            <div style={{ flex: 1 }}>
              <p style={{ color: "#E8D5B5", fontWeight: 700, fontSize: 16 }}>{name}</p>
              <p style={{ color: "#A89070", fontSize: 13 }}>{appState.users[data.owner]?.displayName}</p>
            </div>
            <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 900, fontSize: 22, color: "#FF8C42" }}>{data.total}</span>
          </div>
        )) : <p style={{ color: "#A89070" }}>No teams yet.</p>}
      </div>

      {/* Episode Feed */}
      {feedEpisodes.length > 0 && (
        <div>
          <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 18, fontWeight: 700, color: "#FFD93D", marginBottom: 12, letterSpacing: 1 }}>Episode Feed</h2>
          {feedEpisodes.map(ep => {
            const epElim = normEliminated(eliminated).find(e => e.episode === ep.number);
            const epEvents = ep.events || [];
            return (
              <div key={ep.number} style={{ ...S.card, padding: 0, overflow: "hidden", marginBottom: 16 }}>
                {/* Episode header */}
                <div style={{ padding: "14px 20px", background: "rgba(255,107,53,0.08)", borderBottom: "1px solid rgba(255,140,66,0.12)" }}>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 16, fontWeight: 700, color: "#FF8C42", letterSpacing: 2 }}>EPISODE {ep.number}</p>
                </div>

                {/* Recap */}
                <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, color: "#A89070", letterSpacing: 2, marginBottom: 8 }}>📖 RECAP</p>
                  {ep.recap
                    ? <p style={{ color: "#E8D5B5", fontSize: 15, lineHeight: 1.6 }}>{ep.recap}</p>
                    : <p style={{ color: "rgba(168,144,112,0.4)", fontSize: 14, fontStyle: "italic" }}>No recap posted yet.</p>
                  }
                  {ep.recap && (
                    <ReactionBar
                      reactions={ep.recapReactions || {}}
                      onReact={(emoji) => addReaction(ep.number, "recap", emoji)}
                      currentUser={currentUser}
                      users={appState.users}
                    />
                  )}
                </div>

                {/* Scoring events */}
                <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, color: "#A89070", letterSpacing: 2, padding: "12px 20px 8px" }}>⚡ SCORING EVENTS</p>
                  {epEvents.length > 0 ? (
                    <div style={{ maxHeight: 180, overflowY: "auto", overflowX: "visible", paddingBottom: 8 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 20px" }}>
                        {epEvents.map((ev, i) => {
                          const rule = SCORING_RULES[ev.type] || { label: ev.type, points: 0 };
                          const curTribe = getEffectiveTribe(ev.contestant);
                          return (
                            <div key={i}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 2px" }}>
                                <span style={{ fontWeight: 700, fontSize: 14, color: tribeColor(curTribe), flexShrink: 0 }}>{ev.contestant}</span>
                                <span style={{ color: "#A89070", fontSize: 13, flex: 1 }}>{rule.label}</span>
                                <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 13, color: rule.points >= 0 ? "#4ADE80" : "#F87171", flexShrink: 0 }}>
                                  {rule.points > 0 ? "+" : ""}{rule.points}
                                </span>
                              </div>
                              <ReactionBar
                                reactions={(ep.eventReactions || {})[String(i)] || {}}
                                onReact={(emoji) => addReaction(ep.number, `event_${i}`, emoji)}
                                currentUser={currentUser}
                                users={appState.users}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : <p style={{ color: "rgba(168,144,112,0.4)", fontSize: 14, fontStyle: "italic", padding: "0 20px 12px" }}>No scoring events yet.</p>}
                </div>

                {/* Elimination */}
                <div style={{ padding: "12px 20px" }}>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, color: "#A89070", letterSpacing: 2, marginBottom: 8 }}>🕯️ ELIMINATED</p>
                  {epElim ? (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 2px" }}>
                        <span style={{ color: "#F87171", fontWeight: 700, fontSize: 14, textDecoration: "line-through", flexShrink: 0 }}>{epElim.name}</span>
                        <span style={{ color: "#A89070", fontSize: 13 }}>torch snuffed</span>
                        <svg width={13} height={13} viewBox="0 0 16 16" fill="none" style={{ display: "inline", verticalAlign: "middle" }}>
                          <circle cx="8" cy="7" r="6" fill="#3D3020" stroke="#F87171" strokeWidth="1"/>
                          <circle cx="6" cy="6" r="1.2" fill="#F87171"/>
                          <circle cx="10" cy="6" r="1.2" fill="#F87171"/>
                          <rect x="7" y="9" width="2" height="2" rx="0.5" fill="#F87171"/>
                        </svg>
                      </div>
                      <ReactionBar
                        reactions={ep.eliminationReactions || {}}
                        onReact={(emoji) => addReaction(ep.number, "elimination", emoji)}
                        currentUser={currentUser}
                        users={appState.users}
                      />
                    </div>
                  ) : <p style={{ color: "rgba(168,144,112,0.4)", fontSize: 14, fontStyle: "italic" }}>No elimination recorded.</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {feedEpisodes.length === 0 && (
        <div style={{ ...S.card, textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🌴</p>
          <p style={{ color: "#A89070", fontSize: 15 }}>The season hasn't started yet. Check back after the premiere!</p>
        </div>
      )}
    </div>
  );
}
