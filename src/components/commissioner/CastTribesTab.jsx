import { useState } from "react";
import { S } from "../../styles/theme.js";
import { CONTESTANTS, TRIBE_COLORS } from "../../gameData.js";
import { useLeague } from "../../contexts/LeagueContext.jsx";
import Portrait from "../shared/Portrait.jsx";

const MERGED_COLOR = "#FFD93D";
const STARTING_TRIBES = Object.keys(TRIBE_COLORS);
const ALL_TRIBE_OPTIONS = [...STARTING_TRIBES, "Merged"];

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

export default function CastTribesTab() {
  const { eliminated, tribeOverrides, getEffectiveTribe, confirmEliminate, unEliminate, setContestantTribe } = useLeague();
  const [elimPending, setElimPending] = useState(null);
  const [elimEpInput, setElimEpInput] = useState(1);

  return (
    <div>
      {/* Elimination Tracker */}
      <div style={S.card}>
        <h2 style={S.cardTitle}>Elimination Tracker</h2>
        <p style={{ color: "#A89070", fontSize: 13, marginBottom: 16 }}>Tap a contestant to mark them eliminated. You'll be asked which episode.</p>
        <div style={{ display: "grid", gap: 8 }}>
          {CONTESTANTS.map(c => {
            const isE = isElim(eliminated, c.name);
            const epNum = elimEpisode(eliminated, c.name);
            const curTribe = getEffectiveTribe(c.name);
            const isPending = elimPending === c.name;

            if (isE) {
              return (
                <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)" }}>
                  <Portrait slug={c.slug} tribe={curTribe} size={32} eliminated={true}/>
                  <div style={{ flex: 1 }}>
                    <span style={{ color: "#F87171", fontWeight: 600, textDecoration: "line-through" }}>{c.name}</span>
                    {epNum && <span style={{ color: "#A89070", fontSize: 12, marginLeft: 8 }}>Ep {epNum}</span>}
                  </div>
                  <button onClick={() => unEliminate(c.name)} style={{ ...S.smallBtnGhost, fontSize: 12, color: "#F87171", borderColor: "rgba(248,113,113,0.3)" }}>Un-eliminate</button>
                </div>
              );
            }

            if (isPending) {
              return (
                <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "rgba(255,140,66,0.06)", border: "1px solid rgba(255,140,66,0.2)" }}>
                  <Portrait slug={c.slug} tribe={curTribe} size={32}/>
                  <span style={{ color: "#E8D5B5", fontWeight: 600, flex: 1 }}>{c.name}</span>
                  <label style={{ color: "#A89070", fontSize: 13, marginRight: 4 }}>Episode:</label>
                  <input type="number" min="1" max="20" value={elimEpInput} onChange={e => setElimEpInput(e.target.value)} style={{ ...S.input, width: 64, marginBottom: 0, padding: "6px 10px", fontSize: 14 }} autoFocus/>
                  <button onClick={() => { confirmEliminate(c.name, elimEpInput); setElimPending(null); }} style={S.smallBtn}>☠ Confirm</button>
                  <button onClick={() => setElimPending(null)} style={S.smallBtnGhost}>Cancel</button>
                </div>
              );
            }

            return (
              <div key={c.name} onClick={() => { setElimPending(c.name); setElimEpInput(1); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", cursor: "pointer", border: "1px solid rgba(255,255,255,0.05)" }}>
                <Portrait slug={c.slug} tribe={curTribe} size={32}/>
                <span style={{ color: "#E8D5B5", fontWeight: 600, flex: 1 }}>{c.name}</span>
                <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 3, background: tribeColor(curTribe) + "22", color: tribeColor(curTribe), fontWeight: 700 }}>{curTribe}</span>
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
        {ALL_TRIBE_OPTIONS.map(tribeLabel => {
          const membersInTribe = CONTESTANTS.filter(c => getEffectiveTribe(c.name) === tribeLabel);
          if (membersInTribe.length === 0) return null;
          return (
            <div key={tribeLabel} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: tribeColor(tribeLabel) }}/>
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 14, fontWeight: 700, color: tribeColor(tribeLabel), letterSpacing: 1 }}>{tribeLabel.toUpperCase()}</p>
                <span style={{ color: "#A89070", fontSize: 12 }}>({membersInTribe.length})</span>
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                {membersInTribe.map(c => {
                  const isE = isElim(eliminated, c.name);
                  const swapped = tribeOverrides[c.name] && tribeOverrides[c.name] !== c.tribe;
                  return (
                    <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", opacity: isE ? 0.5 : 1 }}>
                      <Portrait slug={c.slug} tribe={tribeLabel} size={32} eliminated={isE}/>
                      <div style={{ flex: 1 }}>
                        <span style={{ color: "#E8D5B5", fontWeight: 600, textDecoration: isE ? "line-through" : "none" }}>{c.name}</span>
                        {swapped && <span style={{ color: "#A89070", fontSize: 12, marginLeft: 6 }}>[was {c.tribe}]</span>}
                      </div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {ALL_TRIBE_OPTIONS.map(t => (
                          <button key={t} onClick={() => setContestantTribe(c.name, t)} style={{
                            padding: "3px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                            fontFamily: "'Cinzel',serif", fontWeight: 600,
                            border: `1px solid ${tribeColor(t)}55`,
                            background: getEffectiveTribe(c.name) === t ? tribeColor(t) + "33" : "transparent",
                            color: getEffectiveTribe(c.name) === t ? tribeColor(t) : "#A89070",
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
