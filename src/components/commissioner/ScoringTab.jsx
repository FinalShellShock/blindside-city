import { useState } from "react";
import { S } from "../../styles/theme.js";
import { useLeague } from "../../contexts/LeagueContext.jsx";

function Tip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: "1px solid rgba(255,140,66,0.3)", borderRadius: "50%", width: 18, height: 18, color: "#A89070", fontSize: 11, cursor: "pointer", fontFamily: "'Cinzel',serif", fontWeight: 700, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>?</button>
      {open && (
        <span onClick={() => setOpen(false)} style={{ position: "absolute", top: 24, left: 0, zIndex: 50, background: "rgba(26,15,5,0.98)", border: "1px solid rgba(255,140,66,0.25)", borderRadius: 8, padding: "10px 14px", width: 240, color: "#C8B89A", fontSize: 13, lineHeight: 1.5, boxShadow: "0 4px 20px rgba(0,0,0,0.5)", cursor: "default" }}>
          {text}
        </span>
      )}
    </span>
  );
}

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

export default function ScoringTab({ eventForm, setEventForm }) {
  const { appState, addEvent: addEventCtx, removeEvent, eliminated, getEffectiveTribe, contestants, tribeColors, effectiveScoringRules } = useLeague();

  const addEvent = () => addEventCtx(eventForm).then(() => setEventForm({ ...eventForm, contestants: [], event: "" }));
  return (
    <div>
      <div style={S.card}>
        <h2 style={{ ...S.cardTitle, display: "flex", alignItems: "center", gap: 8 }}>Update Scoring <Tip text="Log scoring events from each episode. Select the episode number, the event type, and the contestant(s) involved. Points are applied immediately and reflected in the scoreboard." /></h2>
        <div style={S.formRow}>
          <label style={S.formLabel}>Episode #</label>
          <input type="number" min="1" max="20" value={eventForm.episode} onChange={e => setEventForm({ ...eventForm, episode: parseInt(e.target.value) || 1 })} style={{ ...S.input, width: 80 }}/>
        </div>
        <div style={S.formRow}>
          <label style={S.formLabel}>Scoring Event</label>
          <select value={eventForm.event} onChange={e => setEventForm({ ...eventForm, event: e.target.value })} style={S.select}>
            <option value="">Select event...</option>
            {Object.entries(effectiveScoringRules).map(([k, r]) => (
              <option key={k} value={k}>{r.label} ({r.points > 0 ? "+" : ""}{r.points})</option>
            ))}
          </select>
        </div>
        <div style={S.formRow}>
          <label style={S.formLabel}>Contestants ({eventForm.contestants.length} selected — tap to select/deselect)</label>
          <div style={S.contestantPicker}>
            {contestants.filter(c => !isElim(eliminated, c.name)).map(c => {
              const sel = eventForm.contestants.includes(c.name);
              return (
                <button key={c.name} onClick={() => setEventForm({ ...eventForm, contestants: sel ? eventForm.contestants.filter(x => x !== c.name) : [...eventForm.contestants, c.name] })}
                  style={{ ...S.contestantChip, background: sel ? tribeColor(tribeColors, getEffectiveTribe(c.name)) : "rgba(255,255,255,0.05)", color: sel ? "#fff" : "#A89070", borderColor: sel ? tribeColor(tribeColors, getEffectiveTribe(c.name)) : "rgba(255,255,255,0.1)", fontWeight: sel ? 700 : 400 }}>
                  {c.name}
                </button>
              );
            })}
            {normEliminated(eliminated).length > 0 && (<>
              <div style={{ width: "100%", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "6px 0" }}/>
              {contestants.filter(c => isElim(eliminated, c.name)).map(c => {
                const sel = eventForm.contestants.includes(c.name);
                return (
                  <button key={c.name} onClick={() => setEventForm({ ...eventForm, contestants: sel ? eventForm.contestants.filter(x => x !== c.name) : [...eventForm.contestants, c.name] })}
                    style={{ ...S.contestantChip, background: sel ? "rgba(248,113,113,0.3)" : "rgba(255,255,255,0.03)", color: sel ? "#F87171" : "#555", borderColor: sel ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.06)", textDecoration: "line-through" }}>
                    ☠ {c.name}
                  </button>
                );
              })}
            </>)}
          </div>
        </div>
        <button style={{ ...S.primaryBtn, opacity: !eventForm.contestants.length || !eventForm.event ? 0.4 : 1 }} onClick={addEvent}>
          Add {eventForm.contestants.length > 1 ? `${eventForm.contestants.length} Events` : "Event"}
        </button>
      </div>

      <div style={S.card}>
        <h2 style={S.cardTitle}>Event Log</h2>
        {[...appState.episodes].sort((a, b) => b.number - a.number).map(ep => (
          <div key={ep.number} style={{ marginBottom: 20 }}>
            <p style={S.epLabel}>Episode {ep.number}</p>
            {ep.events.map((ev, i) => (
              <div key={i} style={{ ...S.eventRow, alignItems: "center" }}>
                <span style={S.eventContestant}>{ev.contestant}</span>
                <span style={S.eventLabel}>{effectiveScoringRules[ev.type]?.label}</span>
                <span style={{ ...S.eventPoints, color: effectiveScoringRules[ev.type]?.points >= 0 ? "#4ADE80" : "#F87171" }}>
                  {effectiveScoringRules[ev.type]?.points > 0 ? "+" : ""}{effectiveScoringRules[ev.type]?.points}
                </span>
                <button onClick={() => removeEvent(ep.number, i)} style={S.removeBtn}>✕</button>
              </div>
            ))}
          </div>
        ))}
        {appState.episodes.length === 0 && <p style={{ color: "#A89070" }}>No events recorded yet.</p>}
      </div>
    </div>
  );
}
