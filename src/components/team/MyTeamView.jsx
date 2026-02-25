import { useState } from "react";
import { S } from "../../styles/theme.js";
import { CONTESTANTS, TRIBE_COLORS } from "../../gameData.js";
import Portrait from "../shared/Portrait.jsx";
import MiniChart from "../shared/MiniChart.jsx";
import { SkullIcon } from "../shared/Icons.jsx";

const STOCK_LOGOS = [
  { id: "torch",    label: "Torch",    url: "/logos/logo-torch.jpg" },
  { id: "skull",    label: "Skull",    url: "/logos/logo-skull.jpg" },
  { id: "serpent",  label: "Serpent",  url: "/logos/logo-serpent.jpg" },
  { id: "lion",     label: "Lion",     url: "/logos/logo-lion.jpg" },
  { id: "volcano",  label: "Volcano",  url: "/logos/logo-volcano.jpg" },
  { id: "shield",   label: "Shield",   url: "/logos/logo-shield.jpg" },
  { id: "eagle",    label: "Eagle",    url: "/logos/logo-eagle.jpg" },
  { id: "moon",     label: "Moon",     url: "/logos/logo-moon.jpg" },
  { id: "necklace", label: "Necklace", url: "/logos/logo-necklace.jpg" },
  { id: "shark",    label: "Shark",    url: "/logos/logo-shark.jpg" },
];

const MERGED_COLOR = "#FFD93D";
function tribeColor(tribe) {
  if (tribe === "Merged") return MERGED_COLOR;
  return TRIBE_COLORS[tribe] || "#666";
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

export default function MyTeamView({
  appState,
  currentUser,
  myTeam,
  contestantScores,
  teamScores,
  eliminated,
  tribeOverrides,
  getEffectiveTribe,
  isUserCommissioner,
  saveState,
}) {
  const [editingTeamName, setEditingTeamName] = useState(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [editingMotto, setEditingMotto] = useState(null);
  const [newMotto, setNewMotto] = useState("");
  const [editingLogo, setEditingLogo] = useState(null);
  const [customLogoUrl, setCustomLogoUrl] = useState("");
  const [expandedMember, setExpandedMember] = useState(null);

  const renameTeam = async (old) => {
    if (!newTeamName.trim() || newTeamName === old) { setEditingTeamName(null); return; }
    const teams = { ...appState.teams };
    teams[newTeamName] = { ...teams[old] };
    delete teams[old];
    await saveState({ ...appState, teams });
    setEditingTeamName(null);
    setNewTeamName("");
  };

  const saveMotto = async (tn) => {
    const teams = { ...appState.teams };
    if (teams[tn]) teams[tn].motto = newMotto;
    await saveState({ ...appState, teams });
    setEditingMotto(null);
    setNewMotto("");
  };

  const saveLogo = async (tn, url) => {
    const teams = { ...appState.teams };
    if (teams[tn]) teams[tn].logo = url;
    await saveState({ ...appState, teams });
    setEditingLogo(null);
    setCustomLogoUrl("");
  };

  if (!myTeam) {
    return (
      <div style={S.card}>
        <h2 style={S.cardTitle}>No Team Yet</h2>
        <p style={{ color: "#A89070" }}>{isUserCommissioner ? "Head to the Commissioner tab to set up teams." : "The commissioner hasn't set up your team yet."}</p>
      </div>
    );
  }

  const [teamName, teamData] = myTeam;

  return (
    <div>
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
          <div style={{ flex: 1 }}>
            {editingTeamName === teamName ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <input style={{ ...S.input, marginBottom: 0, flex: 1 }} value={newTeamName} onChange={e => setNewTeamName(e.target.value)} onKeyDown={e => e.key === "Enter" && renameTeam(teamName)} autoFocus/>
                <button style={S.smallBtn} onClick={() => renameTeam(teamName)}>Save</button>
                <button style={S.smallBtnGhost} onClick={() => setEditingTeamName(null)}>Cancel</button>
              </div>
            ) : (
              <h2 style={{ ...S.cardTitle, cursor: "pointer" }} onClick={() => { setEditingTeamName(teamName); setNewTeamName(teamName); }}>
                <span style={{ color: "#FF8C42" }}>🔥</span> {teamName} <span style={{ fontSize: 12, color: "#A89070" }}>✏️</span>
              </h2>
            )}
            {editingMotto === teamName ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                <input style={{ ...S.input, marginBottom: 0, flex: 1 }} placeholder="Enter your team motto..." maxLength={80} value={newMotto} onChange={e => setNewMotto(e.target.value)} onKeyDown={e => e.key === "Enter" && saveMotto(teamName)} autoFocus/>
                <button style={S.smallBtn} onClick={() => saveMotto(teamName)}>Save</button>
                <button style={S.smallBtnGhost} onClick={() => setEditingMotto(null)}>Cancel</button>
              </div>
            ) : (
              <p style={{ color: "#A89070", fontSize: 14, fontStyle: "italic", cursor: "pointer", marginBottom: 8 }} onClick={() => { setEditingMotto(teamName); setNewMotto(teamData.motto || ""); }}>
                {teamData.motto || "Click to add a team motto..."}
              </p>
            )}
          </div>
          {teamData.logo && (
            <div onClick={() => setEditingLogo(teamName)} style={{ position: "relative", width: 72, height: 72, cursor: "pointer", flexShrink: 0 }}>
              <img src={teamData.logo} alt="team logo" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,140,66,0.3)" }}/>
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: "50%", background: "#FF8C42", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, border: "2px solid #1A0F05" }}>✏️</div>
            </div>
          )}
          {!teamData.logo && <button style={{ ...S.smallBtnGhost, fontSize: 11, padding: "6px 10px" }} onClick={() => setEditingLogo(teamName)}>+ Logo</button>}
        </div>

        {editingLogo === teamName && (
          <div style={{ marginTop: 16, padding: 16, background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: "#FF8C42", marginBottom: 12, letterSpacing: 1 }}>CHOOSE A LOGO</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 16 }}>
              {STOCK_LOGOS.map(l => (
                <div key={l.id} onClick={() => saveLogo(teamName, l.url)} style={{ cursor: "pointer", borderRadius: 8, padding: 4, border: `2px solid ${teamData.logo === l.url ? "#FF8C42" : "transparent"}`, background: "rgba(255,255,255,0.03)", transition: "border 0.15s" }}>
                  <img src={l.url} alt={l.label} style={{ width: "100%", aspectRatio: "1", borderRadius: 6, display: "block" }}/>
                  <p style={{ color: "#A89070", fontSize: 10, textAlign: "center", marginTop: 4 }}>{l.label}</p>
                </div>
              ))}
            </div>
            <p style={{ color: "#A89070", fontSize: 12, marginBottom: 6 }}>Or paste a custom image URL:</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...S.input, marginBottom: 0, flex: 1, fontSize: 13 }} placeholder="https://..." value={customLogoUrl} onChange={e => setCustomLogoUrl(e.target.value)}/>
              <button style={S.smallBtn} onClick={() => customLogoUrl.trim() && saveLogo(teamName, customLogoUrl.trim())}>Use</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              {teamData.logo && <button style={{ ...S.smallBtnGhost, fontSize: 11 }} onClick={() => saveLogo(teamName, "")}>Remove Logo</button>}
              <button style={{ ...S.smallBtnGhost, fontSize: 11 }} onClick={() => setEditingLogo(null)}>Cancel</button>
            </div>
          </div>
        )}

        <p style={S.teamTotal}>{teamScores[teamName]?.total || 0} <span style={{ fontSize: 16, opacity: 0.6 }}>pts</span></p>
        {teamScores[teamName]?.progression?.length > 1 && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <MiniChart data={teamScores[teamName].progression} width={280} height={50}/>
          </div>
        )}

        <div style={S.memberGrid}>
          {teamData.members.map(m => {
            const c = CONTESTANTS.find(x => x.name === m);
            const isE = isElim(eliminated, m);
            const currentTribe = getEffectiveTribe(m);
            const tribeChanged = tribeOverrides[m] && tribeOverrides[m] !== c?.tribe;
            const memberEvents = contestantScores[m]?.events || [];
            const isExpanded = expandedMember === m;
            const byEp = {};
            memberEvents.forEach(ev => {
              if (!byEp[ev.episode]) byEp[ev.episode] = [];
              byEp[ev.episode].push(ev);
            });
            return (
              <div key={m} style={{ borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div onClick={() => setExpandedMember(isExpanded ? null : m)} style={{ ...S.memberCard, cursor: "pointer", background: isExpanded ? "rgba(255,140,66,0.07)" : "rgba(255,255,255,0.03)", opacity: isE ? 0.6 : 1 }}>
                  <Portrait slug={c?.slug} tribe={currentTribe} size={40} eliminated={isE}/>
                  <div style={{ flex: 1 }}>
                    <p style={{ ...S.memberName, textDecoration: isE ? "line-through" : "none" }}>{m} {isE && <SkullIcon size={12}/>}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                      <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 3, background: tribeColor(currentTribe) + "33", color: tribeColor(currentTribe), fontWeight: 700 }}>{currentTribe}</span>
                      {tribeChanged && <span style={{ fontSize: 11, color: "#A89070", textDecoration: "line-through" }}>{c?.tribe}</span>}
                      {isE && <span style={{ fontSize: 11, color: "#F87171" }}>· Elim. Ep {elimEpisode(eliminated, m) || "?"}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={S.memberScore}>{contestantScores[m]?.total || 0}</p>
                    <span style={{ color: "#A89070", fontSize: 11, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
                  </div>
                </div>
                {isExpanded && (
                  <div style={{ padding: "12px 16px", background: "rgba(42,26,10,0.5)", borderTop: "1px solid rgba(255,140,66,0.08)" }}>
                    {memberEvents.length > 0 ? (
                      Object.entries(byEp).sort((a, b) => Number(b[0]) - Number(a[0])).map(([ep, evts]) => (
                        <div key={ep} style={{ marginBottom: 10 }}>
                          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700, color: "#FF8C42", marginBottom: 4, letterSpacing: 1 }}>EPISODE {ep}</p>
                          {evts.map((ev, j) => (
                            <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px", marginBottom: 2, borderRadius: 4, background: "rgba(255,255,255,0.02)" }}>
                              <span style={{ color: "#E8D5B5", fontSize: 13 }}>{ev.label}</span>
                              <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 13, color: ev.points >= 0 ? "#4ADE80" : "#F87171" }}>{ev.points > 0 ? "+" : ""}{ev.points}</span>
                            </div>
                          ))}
                        </div>
                      ))
                    ) : <p style={{ color: "#A89070", fontSize: 13, fontStyle: "italic" }}>No scoring events yet.</p>}
                    {memberEvents.length > 0 && (
                      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 4 }}>
                        <span style={{ color: "#A89070", fontSize: 12, marginRight: 8 }}>Total</span>
                        <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 14, color: "#FF8C42" }}>{contestantScores[m]?.total || 0} pts</span>
                      </div>
                    )}
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
