import { useState } from "react";
import { S } from "../../styles/theme.js";
import { useLeague } from "../../contexts/LeagueContext.jsx";
import Portrait from "../shared/Portrait.jsx";

const MERGED_COLOR = "#FFD93D";
function tribeColor(tribeColors, tribe) {
  if (tribe === "Merged") return MERGED_COLOR;
  return tribeColors[tribe] || "#666";
}
function normEliminated(eliminated) {
  return (eliminated || []).map(e =>
    typeof e === "string" ? { name: e, episode: null, type: "voted_out" } : { type: "voted_out", ...e }
  );
}
function isElim(eliminated, name) {
  return normEliminated(eliminated).some(e => e.name === name);
}
function elimRecord(eliminated, name) {
  return normEliminated(eliminated).find(e => e.name === name) || null;
}

const ELIM_TYPES = [
  { value: "voted_out", label: "Voted Out",        icon: "🕯️" },
  { value: "injury",    label: "Injury / Medical", icon: "🩺" },
  { value: "quit",      label: "Quit",             icon: "🏳️" },
];

function elimIcon(type) {
  if (type === "medevac") return "🩺"; // backward compat for old "medevac" records
  return ELIM_TYPES.find(t => t.value === type)?.icon || "🕯️";
}
function elimLabel(type) {
  if (type === "medevac") return "Injury / Medical"; // backward compat
  return ELIM_TYPES.find(t => t.value === type)?.label || "Voted Out";
}

export default function CastTribesTab() {
  const { eliminated, tribeOverrides, getEffectiveTribe, confirmEliminate, unEliminate, setContestantTribe, contestants, tribeColors } = useLeague();
  const startingTribes = Object.keys(tribeColors);
  const allTribeOptions = [...startingTribes, "Merged"];
  const [elimPending, setElimPending] = useState(null);
  const [elimEpInput, setElimEpInput] = useState(1);
  const [elimTypeInput, setElimTypeInput] = useState("voted_out");

  return (
    <div>
      {/* Elimination Tracker */}
      <div style={S.card}>
        <h2 style={S.cardTitle}>Elimination Tracker</h2>
        <p style={{ color: "#A89070", fontSize: 13, marginBottom: 16 }}>Tap a contestant to mark them eliminated. Select the episode and how they left.</p>
        <div style={{ display: "grid", gap: 8 }}>
          {contestants.map(c => {
            const isE = isElim(eliminated, c.name);
            const er = elimRecord(eliminated, c.name);
            const curTribe = getEffectiveTribe(c.name);
            const isPending = elimPending === c.name;

            if (isE) {
              const isVotedOut = !er.type || er.type === "voted_out";
              return (
                <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)" }}>
                  <Portrait slug={c.slug} tribe={curTribe} size={32} eliminated={true} tribeColors={tribeColors}/>
                  <div style={{ flex: 1 }}>
                    <span style={{ color: "#F87171", fontWeight: 600, textDecoration: "line-through" }}>{c.name}</span>
                    {er.episode && <span style={{ color: "#A89070", fontSize: 12, marginLeft: 8 }}>Ep {er.episode}</span>}
                    {!isVotedOut && (
                      <span style={{ color: "#A89070", fontSize: 12, marginLeft: 6 }}>· {elimIcon(er.type)} {elimLabel(er.type)}</span>
                    )}
                  </div>
                  <button onClick={() => unEliminate(c.name)} style={{ ...S.smallBtnGhost, fontSize: 12, color: "#F87171", borderColor: "rgba(248,113,113,0.3)" }}>Un-eliminate</button>
                </div>
              );
            }

            if (isPending) {
              return (
                <div key={c.name} style={{ padding: "12px", borderRadius: 8, background: "rgba(255,140,66,0.06)", border: "1px solid rgba(255,140,66,0.2)" }}>
                  {/* Portrait + name — always on their own line */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <Portrait slug={c.slug} tribe={curTribe} size={32} tribeColors={tribeColors}/>
                    <span style={{ color: "#E8D5B5", fontWeight: 600 }}>{c.name}</span>
                  </div>
                  {/* Controls wrap independently — no risk of clipping portrait+name */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <label style={{ color: "#A89070", fontSize: 13 }}>Ep</label>
                      <select value={elimEpInput} onChange={e => setElimEpInput(e.target.value)} style={{ ...S.select, width: "auto", marginBottom: 0, padding: "6px 10px", fontSize: 14 }}>
                        {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                    <select value={elimTypeInput} onChange={e => setElimTypeInput(e.target.value)} style={{ ...S.select, width: "auto", marginBottom: 0, padding: "6px 10px", fontSize: 14 }}>
                      {ELIM_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        confirmEliminate(c.name, elimEpInput, elimTypeInput);
                        setElimPending(null);
                        setElimTypeInput("voted_out");
                      }}
                      style={S.smallBtn}
                    >
                      ☠ Confirm
                    </button>
                    <button onClick={() => { setElimPending(null); setElimTypeInput("voted_out"); }} style={S.smallBtnGhost}>Cancel</button>
                  </div>
                </div>
              );
            }

            return (
              <div key={c.name} onClick={() => { setElimPending(c.name); setElimEpInput(1); setElimTypeInput("voted_out"); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", cursor: "pointer", border: "1px solid rgba(255,255,255,0.05)" }}>
                <Portrait slug={c.slug} tribe={curTribe} size={32} tribeColors={tribeColors}/>
                <span style={{ color: "#E8D5B5", fontWeight: 600, flex: 1 }}>{c.name}</span>
                <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 3, background: tribeColor(tribeColors, curTribe) + "22", color: tribeColor(tribeColors, curTribe), fontWeight: 700 }}>{curTribe}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tribe Tracker */}
      <div style={S.card}>
        <h2 style={S.cardTitle}>Tribe Tracker</h2>
        <p style={{ color: "#A89070", fontSize: 13, marginBottom: 4 }}>Use this after tribe swaps or the merge. Original tribe shown in brackets.</p>
        <p style={{ color: "#A89070", fontSize: 12, marginBottom: 16, fontStyle: "italic" }}>Changes update tribe colors throughout the entire app.</p>
        {allTribeOptions.map(tribeLabel => {
          const membersInTribe = contestants.filter(c => getEffectiveTribe(c.name) === tribeLabel);
          if (membersInTribe.length === 0) return null;
          return (
            <div key={tribeLabel} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: tribeColor(tribeColors, tribeLabel) }}/>
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 14, fontWeight: 700, color: tribeColor(tribeColors, tribeLabel), letterSpacing: 1 }}>{tribeLabel.toUpperCase()}</p>
                <span style={{ color: "#A89070", fontSize: 12 }}>({membersInTribe.length})</span>
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                {membersInTribe.map(c => {
                  const isE = isElim(eliminated, c.name);
                  const swapped = tribeOverrides[c.name] && tribeOverrides[c.name] !== c.tribe;
                  return (
                    <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", opacity: isE ? 0.5 : 1 }}>
                      <Portrait slug={c.slug} tribe={tribeLabel} size={32} eliminated={isE} tribeColors={tribeColors}/>
                      <div style={{ flex: 1 }}>
                        <span style={{ color: "#E8D5B5", fontWeight: 600, textDecoration: isE ? "line-through" : "none" }}>{c.name}</span>
                        {swapped && <span style={{ color: "#A89070", fontSize: 12, marginLeft: 6 }}>[was {c.tribe}]</span>}
                      </div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {allTribeOptions.map(t => (
                          <button key={t} onClick={() => setContestantTribe(c.name, t)} style={{
                            padding: "3px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                            fontFamily: "'Cinzel',serif", fontWeight: 600,
                            border: `1px solid ${tribeColor(tribeColors, t)}55`,
                            background: getEffectiveTribe(c.name) === t ? tribeColor(tribeColors, t) + "33" : "transparent",
                            color: getEffectiveTribe(c.name) === t ? tribeColor(tribeColors, t) : "#A89070",
                            transition: "all 0.12s",
                          }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
