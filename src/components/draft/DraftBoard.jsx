import { S } from "../../styles/theme.js";
import { useLeague } from "../../contexts/LeagueContext.jsx";
import { useDraft } from "../../hooks/useDraft.js";
import Portrait from "../shared/Portrait.jsx";
import { resetDraft } from "../../firebase.js";

const MERGED_COLOR = "#FFD93D";
function tribeColor(tribeColors, tribe) {
  if (tribe === "Merged") return MERGED_COLOR;
  return tribeColors[tribe] || "#666";
}

export default function DraftBoard({ currentUser, isCommissioner }) {
  const { appState, currentLeagueId, contestants, tribeColors, getEffectiveTribe, saveState } = useLeague();
  const {
    draftState,
    draftLoading,
    isMyTurn,
    currentPickUserId,
    availableContestants,
    timeRemaining,
    makePick,
    rosterByUser,
    picksPerPlayer,
  } = useDraft(currentUser);

  if (draftLoading) return (
    <div style={{ ...S.card, textAlign: "center", padding: 40 }}>
      <p style={{ color: "#A89070", fontFamily: "'Cinzel',serif" }}>Loading draft...</p>
    </div>
  );

  if (!draftState || draftState.status === 'reset') return (
    <div style={{ ...S.card, textAlign: "center", padding: 40 }}>
      <p style={{ color: "#F87171", fontFamily: "'Cinzel',serif", fontSize: 16, marginBottom: 12 }}>
        Draft state not found.
      </p>
      <p style={{ color: "#A89070", fontSize: 14, marginBottom: 20 }}>
        The draft may not have started correctly. The commissioner can reset and try again.
      </p>
      {isCommissioner && (
        <button
          style={S.primaryBtn}
          onClick={async () => {
            await saveState({ ...appState, draftStatus: 'pending' });
          }}
        >
          Back to Lobby
        </button>
      )}
    </div>
  );

  const users = appState?.users || {};
  const isLive = (draftState.timerSeconds || 0) > 0;
  const isDone = draftState.status === 'completed';

  // Round and pick within round
  const totalPlayers = new Set(draftState.order).size;
  const currentRound = Math.floor(draftState.currentPick / totalPlayers) + 1;
  const pickInRound = (draftState.currentPick % totalPlayers) + 1;
  const currentPickerName = users[currentPickUserId]?.displayName || currentPickUserId;

  // Timer color
  const timerColor = timeRemaining === null ? "#A89070"
    : timeRemaining > 20 ? "#4ADE80"
    : timeRemaining > 10 ? "#FFD93D"
    : "#F87171";

  const handleReset = async () => {
    if (!confirm("Reset the draft? All picks will be cleared and teams will not be updated.")) return;
    await resetDraft(currentLeagueId);
    await saveState({ ...appState, draftStatus: 'pending' });
  };

  return (
    <div>
      {/* ── Status banner ── */}
      <div style={{ ...S.card, marginBottom: 16, padding: "16px 24px" }}>
        {isDone ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, color: "#4ADE80", marginBottom: 4 }}>
              Draft Complete!
            </p>
            <p style={{ color: "#A89070", fontSize: 14 }}>Teams have been updated based on draft picks.</p>
            {isCommissioner && (
              <button onClick={handleReset} style={{ ...S.smallBtnGhost, marginTop: 12, fontSize: 12, color: "#F87171", borderColor: "rgba(248,113,113,0.3)" }}>
                Reset Draft
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: "#A89070", letterSpacing: 1, marginBottom: 2 }}>
                ROUND {currentRound} · PICK {pickInRound} OF {totalPlayers}
              </p>
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: 18, fontWeight: 700, color: isMyTurn ? "#FF8C42" : "#E8D5B5" }}>
                {isMyTurn ? "⭐ Your pick!" : `${currentPickerName}'s turn`}
              </p>
            </div>
            {isLive && timeRemaining !== null && (
              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 36, fontWeight: 900, color: timerColor, lineHeight: 1 }}>
                  {timeRemaining}
                </p>
                <p style={{ fontSize: 11, color: "#A89070", letterSpacing: 1 }}>SECONDS</p>
              </div>
            )}
            {isCommissioner && (
              <button onClick={handleReset} style={{ ...S.smallBtnGhost, fontSize: 11, color: "#F87171", borderColor: "rgba(248,113,113,0.3)" }}>
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16, alignItems: "start" }}>

        {/* ── Available contestants grid ── */}
        <div style={S.card}>
          <h2 style={{ ...S.cardTitle, marginBottom: 16 }}>
            {isDone ? "All Contestants" : "Available Contestants"}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
            {contestants.map(c => {
              const isPicked = !availableContestants.find(a => a.name === c.name);
              const tribe = getEffectiveTribe(c.name);
              const color = tribeColor(tribeColors, tribe);
              const canPick = isMyTurn && !isPicked && !isDone;

              return (
                <button
                  key={c.name}
                  onClick={() => canPick && makePick(c.name)}
                  disabled={!canPick}
                  style={{
                    background: isPicked ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                    border: canPick ? `2px solid ${color}` : `1px solid ${isPicked ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 10,
                    padding: 8,
                    cursor: canPick ? "pointer" : "default",
                    opacity: isPicked ? 0.35 : 1,
                    transition: "all 0.15s",
                    textAlign: "center",
                    position: "relative",
                  }}
                >
                  <Portrait name={c.name} slug={c.slug} tribeColors={tribeColors} size={80} />
                  <p style={{ color: isPicked ? "#555" : "#E8D5B5", fontSize: 12, fontWeight: 600, marginTop: 6, lineHeight: 1.2 }}>
                    {c.name}
                  </p>
                  <p style={{ color: isPicked ? "#444" : color, fontSize: 11, marginTop: 2 }}>
                    {tribe}
                  </p>
                  {canPick && (
                    <div style={{ position: "absolute", top: 4, right: 4, background: "#FF8C42", borderRadius: 4, padding: "1px 5px", fontSize: 10, color: "#fff", fontFamily: "'Cinzel',serif", fontWeight: 700 }}>
                      PICK
                    </div>
                  )}
                  {isPicked && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10 }}>
                      <span style={{ fontSize: 20 }}>✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Picks sidebar ── */}
        <div style={S.card}>
          <h2 style={{ ...S.cardTitle, fontSize: 16, marginBottom: 12 }}>Rosters</h2>
          {Object.entries(users).map(([uid, u]) => {
            const picks = rosterByUser[uid] || [];
            const isCurrentPicker = uid === currentPickUserId && !isDone;
            return (
              <div key={uid} style={{ marginBottom: 16 }}>
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 13, fontWeight: 700, color: isCurrentPicker ? "#FF8C42" : "#E8D5B5", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  {isCurrentPicker && <span>⭐</span>}
                  {u.displayName}
                  <span style={{ fontSize: 11, color: "#A89070", fontFamily: "'Crimson Pro',serif", fontWeight: 400 }}>
                    {picks.length}/{picksPerPlayer}
                  </span>
                </p>
                {picks.length === 0 ? (
                  <p style={{ color: "#555", fontSize: 12, paddingLeft: 4 }}>No picks yet</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {picks.map(name => {
                      const tribe = getEffectiveTribe(name);
                      const color = tribeColor(tribeColors, tribe);
                      return (
                        <div key={name} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", background: "rgba(255,255,255,0.03)", borderRadius: 6, borderLeft: `3px solid ${color}` }}>
                          <span style={{ fontSize: 13, color: "#E8D5B5" }}>{name}</span>
                        </div>
                      );
                    })}
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
