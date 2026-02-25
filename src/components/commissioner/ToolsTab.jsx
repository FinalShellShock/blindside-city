import { useState } from "react";
import { S } from "../../styles/theme.js";
import { CONTESTANTS, TRIBE_COLORS, DEFAULT_STATE, SCORING_RULES } from "../../gameData.js";
import { useLeague } from "../../contexts/LeagueContext.jsx";

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

export default function ToolsTab({ currentUser, setView }) {
  const { appState, saveState, eliminated, getEffectiveTribe } = useLeague();
  const [announcementDraft, setAnnouncementDraft] = useState(appState.announcement || "");
  const [teamDraft, setTeamDraft] = useState({ teamName: "", members: [], editOwner: null, editKey: null });

  const saveTeam = async () => {
    if (!teamDraft.teamName.trim() || teamDraft.members.length === 0 || !teamDraft.editOwner) return;
    const teams = { ...appState.teams };
    if (teamDraft.editKey && teamDraft.editKey !== teamDraft.teamName) delete teams[teamDraft.editKey];
    teams[teamDraft.teamName] = {
      owner: teamDraft.editOwner,
      members: teamDraft.members,
      motto: teams[teamDraft.editKey]?.motto || teams[teamDraft.teamName]?.motto || "",
    };
    await saveState({ ...appState, teams });
    setTeamDraft({ teamName: "", members: [], editOwner: null, editKey: null });
  };

  const deleteTeam = async (tn) => {
    const teams = { ...appState.teams };
    delete teams[tn];
    await saveState({ ...appState, teams });
  };

  const toggleCommissioner = async (u) => {
    const c = [...(appState.commissioners || [])];
    const i = c.indexOf(u);
    if (i >= 0) c.splice(i, 1);
    else c.push(u);
    await saveState({ ...appState, commissioners: c });
  };

  return (
    <div>
      {/* Announcement */}
      <div style={S.card}>
        <h2 style={S.cardTitle}>League Announcement</h2>
        <p style={{ color: "#A89070", fontSize: 13, marginBottom: 12 }}>Shows as a banner at the top for all players, and on the Home page.</p>
        <input style={S.input} placeholder="e.g. Draft party Saturday at 7pm!" value={announcementDraft} onChange={e => setAnnouncementDraft(e.target.value)}/>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...S.primaryBtn, flex: 1 }} onClick={() => saveState({ ...appState, announcement: announcementDraft })}>Update</button>
          <button style={{ ...S.smallBtnGhost, padding: "12px 16px" }} onClick={() => { saveState({ ...appState, announcement: "" }); setAnnouncementDraft(""); }}>Clear</button>
        </div>
      </div>

      {/* Manage Teams */}
      <div style={S.card}>
        <h2 style={S.cardTitle}>Manage Teams</h2>
        <div style={S.formRow}>
          <label style={S.formLabel}>Team Name</label>
          <input style={S.input} placeholder="e.g. Kaloboration" value={teamDraft.teamName} onChange={e => setTeamDraft({ ...teamDraft, teamName: e.target.value })}/>
        </div>
        <div style={S.formRow}>
          <label style={S.formLabel}>Team Owner</label>
          <select value={teamDraft.editOwner || ""} onChange={e => setTeamDraft({ ...teamDraft, editOwner: e.target.value })} style={S.select}>
            <option value="">Select owner...</option>
            {Object.entries(appState.users).map(([k, u]) => (<option key={k} value={k}>{u.displayName}</option>))}
          </select>
        </div>
        <div style={S.formRow}>
          <label style={S.formLabel}>Contestants ({teamDraft.members.length} selected)</label>
          <div style={S.contestantPicker}>
            {CONTESTANTS.map(c => {
              const sel = teamDraft.members.includes(c.name);
              const curTribe = getEffectiveTribe(c.name);
              return (
                <button key={c.name} onClick={() => setTeamDraft({ ...teamDraft, members: sel ? teamDraft.members.filter(m => m !== c.name) : [...teamDraft.members, c.name] })}
                  style={{ ...S.contestantChip, background: sel ? tribeColor(curTribe) : "rgba(255,255,255,0.05)", color: sel ? "#fff" : "#A89070", borderColor: sel ? tribeColor(curTribe) : "rgba(255,255,255,0.1)" }}>
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
        <button style={S.primaryBtn} onClick={saveTeam}>Save Team</button>
      </div>

      {/* Current Teams */}
      <div style={S.card}>
        <h2 style={S.cardTitle}>Current Teams</h2>
        {Object.entries(appState.teams || {}).map(([name, team]) => (
          <div key={name} style={S.existingTeam}>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#E8D5B5", fontWeight: 700, marginBottom: 4 }}>{name}</p>
              <p style={{ color: "#A89070", fontSize: 13, marginBottom: 2 }}>Owner: {appState.users[team.owner]?.displayName}</p>
              {team.motto && <p style={{ color: "#A89070", fontSize: 12, fontStyle: "italic", marginBottom: 6 }}>"{team.motto}"</p>}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {team.members.map(m => {
                  const curTribe = getEffectiveTribe(m);
                  return (
                    <span key={m} style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: tribeColor(curTribe) + "33", color: tribeColor(curTribe), textDecoration: isElim(eliminated, m) ? "line-through" : "none" }}>
                      {m}
                    </span>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.editBtn} onClick={() => setTeamDraft({ teamName: name, members: [...team.members], editOwner: team.owner, editKey: name })}>Edit</button>
              <button style={S.removeBtn} onClick={() => deleteTeam(name)}>Delete</button>
            </div>
          </div>
        ))}
        {Object.keys(appState.teams || {}).length === 0 && <p style={{ color: "#A89070" }}>No teams created yet.</p>}
      </div>

      {/* Commissioner Powers */}
      <div style={S.card}>
        <h2 style={S.cardTitle}>Commissioner Powers</h2>
        <p style={{ color: "#A89070", fontSize: 13, marginBottom: 12 }}>Grant or revoke commissioner access.</p>
        {Object.entries(appState.users).map(([key, u]) => {
          const isC = (appState.commissioners || []).includes(key);
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#E8D5B5" }}>{u.displayName}</span>
                {isC && <span style={S.commBadge}>COMMISH</span>}
              </div>
              {key !== currentUser && <button style={isC ? S.removeBtn : S.editBtn} onClick={() => toggleCommissioner(key)}>{isC ? "Revoke" : "Grant"}</button>}
            </div>
          );
        })}
      </div>

      {/* League Settings */}
      <div style={S.card}>
        <h2 style={S.cardTitle}>League Settings</h2>
        <div style={S.formRow}>
          <label style={S.formLabel}>League Name</label>
          <input style={S.input} value={appState.leagueName} onChange={e => saveState({ ...appState, leagueName: e.target.value })}/>
        </div>
      </div>

      {/* Scoring Rules */}
      <div style={S.card}>
        <h2 style={S.cardTitle}>Scoring Rules</h2>
        <p style={{ color: "#A89070", fontSize: 13, marginBottom: 16 }}>Adjust point values for your league. Changes apply to all scoring immediately.</p>
        <div style={{ display: "grid", gap: 6 }}>
          {Object.entries(SCORING_RULES).map(([key, rule]) => {
            const current = (appState.scoringRules || {})[key] !== undefined
              ? (appState.scoringRules || {})[key]
              : rule.points;
            const isModified = current !== rule.points;
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: isModified ? "rgba(255,140,66,0.06)" : "rgba(255,255,255,0.02)", borderRadius: 8, border: isModified ? "1px solid rgba(255,140,66,0.2)" : "1px solid transparent" }}>
                <span style={{ flex: 1, color: "#E8D5B5", fontSize: 14 }}>{rule.label}</span>
                {isModified && <span style={{ fontSize: 11, color: "#A89070" }}>default: {rule.points > 0 ? "+" : ""}{rule.points}</span>}
                <button onClick={() => {
                  const overrides = { ...(appState.scoringRules || {}), [key]: Math.max(-20, current - 1) };
                  saveState({ ...appState, scoringRules: overrides });
                }} style={{ ...S.smallBtnGhost, padding: "2px 8px", fontSize: 16, lineHeight: 1 }}>−</button>
                <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 16, color: current >= 0 ? "#4ADE80" : "#F87171", minWidth: 36, textAlign: "center" }}>
                  {current > 0 ? "+" : ""}{current}
                </span>
                <button onClick={() => {
                  const overrides = { ...(appState.scoringRules || {}), [key]: Math.min(50, current + 1) };
                  saveState({ ...appState, scoringRules: overrides });
                }} style={{ ...S.smallBtnGhost, padding: "2px 8px", fontSize: 16, lineHeight: 1 }}>+</button>
                {isModified && (
                  <button onClick={() => {
                    const overrides = { ...(appState.scoringRules || {}) };
                    delete overrides[key];
                    saveState({ ...appState, scoringRules: overrides });
                  }} style={{ ...S.smallBtnGhost, fontSize: 11, padding: "2px 6px", color: "#A89070" }}>Reset</button>
                )}
              </div>
            );
          })}
        </div>
        {Object.keys(appState.scoringRules || {}).length > 0 && (
          <button style={{ ...S.smallBtnGhost, marginTop: 12, fontSize: 12 }} onClick={() => saveState({ ...appState, scoringRules: {} })}>
            Reset All to Defaults
          </button>
        )}
      </div>

      {/* Danger Zone */}
      <div style={{ ...S.card, borderColor: "rgba(248,113,113,0.3)" }}>
        <h2 style={{ ...S.cardTitle, color: "#F87171" }}>Danger Zone</h2>
        <button style={{ ...S.removeBtn, padding: "8px 16px", fontSize: 14 }} onClick={async () => {
          if (confirm("Reset ALL data? This cannot be undone.")) {
            await saveState(DEFAULT_STATE);
            setView("home");
          }
        }}>Reset Entire League</button>
      </div>
    </div>
  );
}
