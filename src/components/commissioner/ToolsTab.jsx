import { useState, useRef } from "react";
import { S } from "../../styles/theme.js";
import { DEFAULT_STATE, SCORING_RULES } from "../../gameData.js";
import { useLeague } from "../../contexts/LeagueContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { resetDraft } from "../../firebase.js";

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

function Tip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: "none", border: "1px solid rgba(255,140,66,0.3)", borderRadius: "50%", width: 18, height: 18, color: "#A89070", fontSize: 11, cursor: "pointer", fontFamily: "'Cinzel',serif", fontWeight: 700, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
      >?</button>
      {open && (
        <span
          onClick={() => setOpen(false)}
          style={{ position: "absolute", top: 24, left: 0, zIndex: 50, background: "rgba(26,15,5,0.98)", border: "1px solid rgba(255,140,66,0.25)", borderRadius: 8, padding: "10px 14px", width: 240, color: "#C8B89A", fontSize: 13, lineHeight: 1.5, boxShadow: "0 4px 20px rgba(0,0,0,0.5)", cursor: "default" }}
        >
          {text}
        </span>
      )}
    </span>
  );
}

export default function ToolsTab({ currentUser, setView }) {
  const { appState, saveState, eliminated, getEffectiveTribe, regenInviteCode, removeLeague, contestants, tribeColors, currentLeagueId, userLeagues, effectiveScoringRules } = useLeague();
  const { firebaseUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [regenBusy, setRegenBusy] = useState(false);
  // custom rules: editingId = which custom rule's name is being edited inline
  const [editingId, setEditingId] = useState(null);
  const [editingLabel, setEditingLabel] = useState("");

  const handleCopyCode = () => {
    if (!appState?.inviteCode) return;
    navigator.clipboard.writeText(appState.inviteCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRegenCode = async () => {
    setRegenBusy(true);
    await regenInviteCode();
    setRegenBusy(false);
  };
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
      {/* Draft */}
      <div style={S.card}>
        <h2 style={{ ...S.cardTitle, display: "flex", alignItems: "center", gap: 8 }}>Draft <Tip text="Run a live snake draft where players take turns picking contestants. Open the lobby first, then start when everyone has joined. You can also skip the draft and assign teams manually below." /></h2>
        <p style={{ color: "#A89070", fontSize: 13, marginBottom: 16 }}>
          Run a snake draft to assign contestants to teams. Teams are created automatically when the draft completes. You can also skip drafting and assign teams manually below.
        </p>
        {appState.draftStatus === 'completed' ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "#4ADE80", fontFamily: "'Cinzel',serif", fontSize: 14 }}>✓ Draft completed</span>
            <button
              style={{ ...S.smallBtnGhost, fontSize: 12 }}
              onClick={() => setView("draft")}
            >View Results</button>
            <button
              style={{ ...S.smallBtnGhost, fontSize: 12, color: "#F87171", borderColor: "rgba(248,113,113,0.3)" }}
              onClick={() => { if (confirm("Reset the draft? Teams will not be changed.")) saveState({ ...appState, draftStatus: 'not_started' }); }}
            >Reset Draft</button>
          </div>
        ) : appState.draftStatus === 'active' ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ color: "#FF8C42", fontFamily: "'Cinzel',serif", fontSize: 14 }}>● Draft in progress</span>
            <button style={{ ...S.smallBtn }} onClick={() => setView("draft")}>Go to Draft Board</button>
            <button
              style={{ ...S.smallBtnGhost, fontSize: 12, color: "#F87171", borderColor: "rgba(248,113,113,0.3)" }}
              onClick={async () => {
                if (!confirm("Cancel the draft? All picks will be discarded and the draft will be removed entirely.")) return;
                await resetDraft(currentLeagueId);
                await saveState({ ...appState, draftStatus: 'not_started' });
              }}
            >Cancel Draft</button>
          </div>
        ) : appState.draftStatus === 'pending' ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "#FFD93D", fontFamily: "'Cinzel',serif", fontSize: 14 }}>● Draft lobby open</span>
            <button style={{ ...S.smallBtn }} onClick={() => setView("draft")}>Go to Lobby</button>
            <button
              style={{ ...S.smallBtnGhost, fontSize: 12 }}
              onClick={() => saveState({ ...appState, draftStatus: 'not_started' })}
            >Cancel</button>
          </div>
        ) : Object.keys(appState.teams || {}).length > 0 ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>🔒</span>
              <span style={{ color: "#A89070", fontSize: 13 }}>
                Teams are already assigned. Clear all teams to enable drafting.
              </span>
            </div>
            <button
              style={{ ...S.smallBtnGhost, fontSize: 12, color: "#F87171", borderColor: "rgba(248,113,113,0.3)" }}
              onClick={async () => {
                if (!confirm("Clear all teams? This cannot be undone and will enable the draft.")) return;
                await saveState({ ...appState, teams: {} });
              }}
            >
              Clear All Teams
            </button>
          </div>
        ) : (
          <button
            style={S.primaryBtn}
            onClick={() => saveState({ ...appState, draftStatus: 'pending' })}
          >
            Open Draft Lobby
          </button>
        )}
      </div>

      {/* Announcement */}
      <div style={S.card}>
        <h2 style={{ ...S.cardTitle, display: "flex", alignItems: "center", gap: 8 }}>League Announcement <Tip text="Post a message that appears as a banner at the top of the app for all league members. Great for draft reminders, episode night alerts, or trash talk. Clear it when it's no longer relevant." /></h2>
        <p style={{ color: "#A89070", fontSize: 13, marginBottom: 12 }}>Shows as a banner at the top for all players, and on the Home page.</p>
        <input style={S.input} placeholder="e.g. Draft party Saturday at 7pm!" value={announcementDraft} onChange={e => setAnnouncementDraft(e.target.value)}/>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...S.primaryBtn, flex: 1 }} onClick={() => saveState({ ...appState, announcement: announcementDraft, announcementUpdatedAt: new Date().toISOString() })}>Update</button>
          <button style={{ ...S.smallBtnGhost, padding: "12px 16px" }} onClick={() => { saveState({ ...appState, announcement: "", announcementUpdatedAt: null }); setAnnouncementDraft(""); }}>Clear</button>
        </div>
      </div>

      {/* Manage Teams */}
      <div style={S.card}>
        <h2 style={{ ...S.cardTitle, display: "flex", alignItems: "center", gap: 8 }}>Manage Teams <Tip text="Manually create or edit teams without using the draft. Pick an owner, a team name, and select their contestants. Use this if you're assigning teams by hand or need to make corrections after the draft." /></h2>
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
            {contestants.map(c => {
              const sel = teamDraft.members.includes(c.name);
              const curTribe = getEffectiveTribe(c.name);
              return (
                <button key={c.name} onClick={() => setTeamDraft({ ...teamDraft, members: sel ? teamDraft.members.filter(m => m !== c.name) : [...teamDraft.members, c.name] })}
                  style={{ ...S.contestantChip, background: sel ? tribeColor(tribeColors, curTribe) : "rgba(255,255,255,0.05)", color: sel ? "#fff" : "#A89070", borderColor: sel ? tribeColor(tribeColors, curTribe) : "rgba(255,255,255,0.1)" }}>
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
                    <span key={m} style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: tribeColor(tribeColors, curTribe) + "33", color: tribeColor(tribeColors, curTribe), textDecoration: isElim(eliminated, m) ? "line-through" : "none" }}>
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
        <h2 style={{ ...S.cardTitle, display: "flex", alignItems: "center", gap: 8 }}>Commissioner Powers <Tip text="Grant other league members commissioner access so they can also manage scoring, teams, and tools. You cannot revoke your own commissioner status." /></h2>
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
        <h2 style={{ ...S.cardTitle, display: "flex", alignItems: "center", gap: 8 }}>League Settings <Tip text="Rename your league. The name appears in the header switcher and on the join/create screen." /></h2>
        <div style={S.formRow}>
          <label style={S.formLabel}>League Name</label>
          <input style={S.input} value={appState.leagueName} onChange={e => saveState({ ...appState, leagueName: e.target.value })}/>
        </div>
      </div>

      {/* Scoring Rules — unified built-in + custom */}
      <div style={S.card}>
        <h2 style={{ ...S.cardTitle, display: "flex", alignItems: "center", gap: 8 }}>Scoring Rules <Tip text="Adjust point values for built-in events using the +/− buttons. Add custom rules for anything not covered (e.g. a special twist). Changes apply immediately to all scores." /></h2>
        <p style={{ color: "#A89070", fontSize: 13, marginBottom: 16 }}>
          Adjust point values or add custom rules. Changes apply to all scoring immediately.
        </p>
        <div style={{ display: "grid", gap: 6 }}>

          {/* ── Built-in rules ── */}
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
                  const overrides = { ...(appState.scoringRules || {}), [key]: Math.max(-50, current - 1) };
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

          {/* ── Custom rules ── */}
          {(appState.customRules || []).map(rule => {
            const inUse = (appState.episodes || []).some(ep =>
              (ep.events || []).some(ev => ev.type === rule.id)
            );
            const isEditing = editingId === rule.id;
            return (
              <div key={rule.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(255,140,66,0.04)", borderRadius: 8, border: "1px solid rgba(255,140,66,0.15)" }}>
                {isEditing ? (
                  <input
                    autoFocus
                    style={{ ...S.input, flex: 1, padding: "4px 8px", fontSize: 14, marginBottom: 0 }}
                    value={editingLabel}
                    onChange={e => setEditingLabel(e.target.value)}
                    onBlur={() => {
                      if (editingLabel.trim()) {
                        const updated = (appState.customRules || []).map(r => r.id === rule.id ? { ...r, label: editingLabel.trim() } : r);
                        saveState({ ...appState, customRules: updated });
                      }
                      setEditingId(null);
                    }}
                    onKeyDown={e => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") { setEditingId(null); } }}
                    maxLength={60}
                  />
                ) : (
                  <span style={{ flex: 1, color: "#E8D5B5", fontSize: 14 }}>{rule.label}</span>
                )}
                {!isEditing && (
                  <button
                    title="Edit name"
                    onClick={() => { setEditingId(rule.id); setEditingLabel(rule.label); }}
                    style={{ ...S.smallBtnGhost, padding: "2px 6px", fontSize: 13, color: "#A89070" }}
                  >✎</button>
                )}
                {inUse
                  ? <span style={{ fontSize: 11, color: "#A89070", padding: "2px 6px", minWidth: 44 }}>in use</span>
                  : <button
                      style={{ ...S.removeBtn, fontSize: 12, padding: "2px 8px" }}
                      onClick={() => {
                        const updated = (appState.customRules || []).filter(r => r.id !== rule.id);
                        saveState({ ...appState, customRules: updated });
                      }}
                    >✕</button>
                }
                <button onClick={() => {
                  const updated = (appState.customRules || []).map(r => r.id === rule.id ? { ...r, points: Math.max(-50, r.points - 1) } : r);
                  saveState({ ...appState, customRules: updated });
                }} style={{ ...S.smallBtnGhost, padding: "2px 8px", fontSize: 16, lineHeight: 1 }}>−</button>
                <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 16, color: rule.points >= 0 ? "#4ADE80" : "#F87171", minWidth: 36, textAlign: "center" }}>
                  {rule.points > 0 ? "+" : ""}{rule.points}
                </span>
                <button onClick={() => {
                  const updated = (appState.customRules || []).map(r => r.id === rule.id ? { ...r, points: Math.min(50, r.points + 1) } : r);
                  saveState({ ...appState, customRules: updated });
                }} style={{ ...S.smallBtnGhost, padding: "2px 8px", fontSize: 16, lineHeight: 1 }}>+</button>
              </div>
            );
          })}

          {/* ── Add Custom Rule row ── */}
          <button
            onClick={() => {
              const newRule = { id: `custom_${Date.now()}`, label: "New Custom Rule", points: 5 };
              const updated = [...(appState.customRules || []), newRule];
              saveState({ ...appState, customRules: updated }).then(() => {
                setEditingId(newRule.id);
                setEditingLabel(newRule.label);
              });
            }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "transparent", border: "1px dashed rgba(255,140,66,0.3)", borderRadius: 8, cursor: "pointer", color: "#FF8C42", fontSize: 14, fontFamily: "'Crimson Pro',serif", width: "100%", textAlign: "left" }}
          >
            + Add Custom Rule
          </button>

        </div>

        {/* Reset to defaults */}
        <button
          style={{ ...S.smallBtnGhost, marginTop: 12, fontSize: 12 }}
          onClick={() => {
            if (confirm("Reset all point values to defaults and delete all custom rules?")) {
              saveState({ ...appState, scoringRules: {}, customRules: [] });
            }
          }}
        >
          Reset to Defaults
        </button>
      </div>

      {/* Invite Code */}
      <div style={S.card}>
        <h2 style={{ ...S.cardTitle, display: "flex", alignItems: "center", gap: 8 }}>Invite Code <Tip text="Share this code with anyone you want to invite to the league. They'll enter it on the Join screen. Regenerate to invalidate the old code if needed." /></h2>
        <p style={{ color: "#A89070", fontSize: 13, marginBottom: 16 }}>
          Share this code with players so they can join this league.
        </p>
        {appState?.inviteCode ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{
              fontFamily: "'Cinzel',serif",
              fontSize: 28,
              fontWeight: 700,
              color: "#FF8C42",
              letterSpacing: 6,
              background: "rgba(255,140,66,0.08)",
              border: "1px solid rgba(255,140,66,0.25)",
              borderRadius: 8,
              padding: "8px 20px",
              flex: 1,
              textAlign: "center",
            }}>
              {appState.inviteCode}
            </span>
            <button style={S.editBtn} onClick={handleCopyCode}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        ) : (
          <p style={{ color: "#A89070", fontSize: 13, marginBottom: 12 }}>No invite code yet — click Generate to create one.</p>
        )}
        <button
          style={{ ...S.smallBtnGhost, fontSize: 12, opacity: regenBusy ? 0.5 : 1 }}
          onClick={handleRegenCode}
          disabled={regenBusy}
        >
          {regenBusy ? "Generating..." : appState?.inviteCode ? "Regenerate Code" : "Generate Code"}
        </button>
      </div>

      {/* Migrate Legacy Events */}
      <div style={S.card}>
        <h2 style={{ ...S.cardTitle, display: "flex", alignItems: "center", gap: 8 }}>Migrate Legacy Events <Tip text="Converts individual events from before the tribe system to tribe events. Section 1 shows auto-detectable same-tribe groups. Section 2 shows everything else — mixed or partial groups — so you can manually convert or leave them." /></h2>
        <p style={{ color: "#A89070", fontSize: 13, marginBottom: 16 }}>
          Two sections: auto-detected groups (convert all at once) and a manual review section for anything the tool couldn't auto-detect. Color-coded by tribe.
        </p>
        {(() => {
          const rawElim = (appState.eliminated || []).map(e =>
            typeof e === "string" ? { name: e, episode: null } : e
          );
          function activeAtEp(episode, tribe) {
            return contestants.filter(c => {
              if (getEffectiveTribe(c.name) !== tribe) return false;
              const er = rawElim.find(e => e.name === c.name);
              if (!er) return true;
              return er.episode === null || er.episode > episode;
            }).map(c => c.name).sort();
          }

          // Scan all episodes: separate into auto-convert vs manual review
          const conversions = [];   // same-tribe groups that can be bulk-converted
          const reviewItems = [];   // everything else that's still individual events

          (appState.episodes || []).forEach(ep => {
            const byType = {};
            (ep.events || []).forEach((ev, idx) => {
              if (ev.tribe || ev.tribes) return; // already converted
              if (!ev.contestant) return;
              if (!byType[ev.type]) byType[ev.type] = [];
              byType[ev.type].push({ idx, name: ev.contestant });
            });
            Object.entries(byType).forEach(([type, entries]) => {
              const names = entries.map(e => e.name).sort();
              const tribesPresent = [...new Set(names.map(n => getEffectiveTribe(n)))];

              if (tribesPresent.length === 1) {
                const tribe = tribesPresent[0];
                const active = activeAtEp(ep.number, tribe);
                const isExact = JSON.stringify(names) === JSON.stringify(active);
                const isSubset = !isExact && names.every(n => active.includes(n));
                if (isExact || isSubset) {
                  conversions.push({ episode: ep.number, type, tribe, indices: entries.map(e => e.idx), names, isExact, activeCount: active.length });
                  return; // handled
                }
              }
              // Didn't auto-detect → goes to manual review
              reviewItems.push({ episode: ep.number, type, entries, tribesPresent, singleTribe: tribesPresent.length === 1 ? tribesPresent[0] : null });
            });
          });

          const nothing = conversions.length === 0 && reviewItems.length === 0;

          async function convertGroup(indices, epNum, tribe, names) {
            if (!confirm(`Convert ${indices.length} event${indices.length !== 1 ? "s" : ""} (Ep ${epNum} · ${tribe}) to a tribe event?`)) return;
            const eps = JSON.parse(JSON.stringify(appState.episodes || []));
            const ep = eps.find(e => e.number === epNum);
            if (!ep) return;
            [...indices].sort((a, b) => b - a).forEach(i => ep.events.splice(i, 1));
            ep.events.push({ tribe, type: reviewItems.find(r => r.episode === epNum)?.type || conversions.find(c => c.episode === epNum)?.type, contestants: names });
            await saveState({ ...appState, episodes: eps });
          }

          return (
            <div>
              {/* ── Section 1: Auto-detectable ── */}
              {conversions.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ color: "#E8D5B5", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>✅ Auto-detectable ({conversions.length} group{conversions.length !== 1 ? "s" : ""})</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                    {conversions.map((c, i) => (
                      <div key={i} style={{ padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, borderLeft: `3px solid ${tribeColor(tribeColors, c.tribe)}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ color: tribeColor(tribeColors, c.tribe), fontFamily: "'Cinzel',serif", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>{c.tribe.toUpperCase()}</span>
                          <span style={{ color: "#A89070", fontSize: 13 }}>· Ep {c.episode} · {effectiveScoringRules[c.type]?.label || c.type}</span>
                          {!c.isExact && <span style={{ fontSize: 11, color: "#FFD93D", background: "rgba(255,217,61,0.1)", padding: "1px 6px", borderRadius: 4 }}>{c.names.length}/{c.activeCount} members</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    style={S.primaryBtn}
                    onClick={async () => {
                      if (!confirm(`Convert all ${conversions.length} auto-detected group${conversions.length !== 1 ? "s" : ""} to tribe events?`)) return;
                      const eps = JSON.parse(JSON.stringify(appState.episodes || []));
                      conversions.forEach(conv => {
                        const ep = eps.find(e => e.number === conv.episode);
                        if (!ep) return;
                        conv.indices.sort((a, b) => b - a).forEach(i => ep.events.splice(i, 1));
                        ep.events.push({ tribe: conv.tribe, type: conv.type, contestants: conv.names });
                      });
                      await saveState({ ...appState, episodes: eps });
                    }}
                  >Convert All {conversions.length} Auto-Detected Group{conversions.length !== 1 ? "s" : ""}</button>
                </div>
              )}

              {/* ── Section 2: Manual review ── */}
              {reviewItems.length > 0 && (
                <div>
                  <p style={{ color: "#E8D5B5", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>🔍 Manual review ({reviewItems.length} group{reviewItems.length !== 1 ? "s" : ""})</p>
                  <p style={{ color: "#A89070", fontSize: 12, marginBottom: 10 }}>These couldn't be auto-detected. If they look like a tribe event, hit "Convert as TRIBE". Mixed tribes stay as individual events.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {reviewItems.map((item, i) => (
                      <div key={i} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, borderLeft: `3px solid ${item.singleTribe ? tribeColor(tribeColors, item.singleTribe) : "#555"}` }}>
                        <p style={{ color: "#E8D5B5", fontSize: 13, marginBottom: 6 }}>Ep {item.episode} · {effectiveScoringRules[item.type]?.label || item.type}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                          {item.entries.map(e => (
                            <span key={e.name} style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: tribeColor(tribeColors, getEffectiveTribe(e.name)) + "33", color: tribeColor(tribeColors, getEffectiveTribe(e.name)) }}>
                              {e.name}
                            </span>
                          ))}
                        </div>
                        {item.singleTribe ? (
                          <button
                            style={{ ...S.smallBtnGhost, fontSize: 12, borderColor: tribeColor(tribeColors, item.singleTribe) + "66", color: tribeColor(tribeColors, item.singleTribe) }}
                            onClick={async () => {
                              if (!confirm(`Convert ${item.entries.length} individual event${item.entries.length !== 1 ? "s" : ""} to a ${item.singleTribe} tribe event?`)) return;
                              const eps = JSON.parse(JSON.stringify(appState.episodes || []));
                              const ep = eps.find(e => e.number === item.episode);
                              if (!ep) return;
                              item.entries.map(e => e.idx).sort((a, b) => b - a).forEach(i => ep.events.splice(i, 1));
                              ep.events.push({ tribe: item.singleTribe, type: item.type, contestants: item.entries.map(e => e.name) });
                              await saveState({ ...appState, episodes: eps });
                            }}
                          >Convert as {item.singleTribe.toUpperCase()}</button>
                        ) : (
                          <span style={{ fontSize: 12, color: "#666" }}>Mixed tribes ({item.tribesPresent.join(", ")}) — stays as individual events</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {nothing && <p style={{ color: "#4ADE80", fontSize: 14 }}>✓ No legacy events to convert.</p>}
            </div>
          );
        })()}
      </div>

      {/* Danger Zone */}
      <div style={{ ...S.card, borderColor: "rgba(248,113,113,0.3)" }}>
        <h2 style={{ ...S.cardTitle, color: "#F87171", display: "flex", alignItems: "center", gap: 8 }}>Danger Zone <Tip text="Reset wipes all league data back to defaults (teams, scores, episodes). Delete permanently removes the entire league. Both actions are irreversible." /></h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button style={{ ...S.removeBtn, padding: "8px 16px", fontSize: 14 }} onClick={async () => {
            if (confirm("Reset ALL data? This cannot be undone.")) {
              await saveState(DEFAULT_STATE);
              setView("home");
            }
          }}>Reset Entire League</button>
          <button style={{ ...S.removeBtn, padding: "8px 16px", fontSize: 14 }} onClick={async () => {
            if (!confirm(`Permanently delete "${appState?.leagueName || "this league"}"? All data will be lost and cannot be recovered.`)) return;
            if (!confirm("Are you sure? This is irreversible.")) return;
            const fallback = userLeagues.find(l => l.id !== currentLeagueId)?.id || "main";
            await removeLeague(firebaseUser?.uid, currentLeagueId, appState?.inviteCode, fallback);
            setView("home");
          }}>Delete League</button>
        </div>
      </div>
    </div>
  );
}
