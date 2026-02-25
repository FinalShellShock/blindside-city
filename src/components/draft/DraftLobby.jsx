import { useState } from "react";
import { S } from "../../styles/theme.js";
import { useLeague } from "../../contexts/LeagueContext.jsx";
import { startDraft } from "../../firebase.js";
import { buildSnakeOrder } from "../../hooks/useDraft.js";

export default function DraftLobby({ currentUser, isCommissioner }) {
  const { appState, currentLeagueId, contestants, saveState } = useLeague();

  const users = Object.entries(appState?.users || {});
  const draftSettings = appState?.draftSettings || {};

  const [picksPerPlayer, setPicksPerPlayer] = useState(draftSettings.picksPerPlayer || 3);
  const [timerSeconds, setTimerSeconds] = useState(draftSettings.timerSeconds ?? 0);
  const [draftOrder, setDraftOrder] = useState(
    draftSettings.draftOrder || users.map(([uid]) => uid)
  );
  const [busy, setBusy] = useState(false);

  const moveUser = (uid, dir) => {
    const idx = draftOrder.indexOf(uid);
    const next = idx + dir;
    if (next < 0 || next >= draftOrder.length) return;
    const updated = [...draftOrder];
    [updated[idx], updated[next]] = [updated[next], updated[idx]];
    setDraftOrder(updated);
  };

  const handleStart = async () => {
    if (draftOrder.length === 0) return;
    setBusy(true);
    try {
      const totalPicks = draftOrder.length * picksPerPlayer;
      if (totalPicks > contestants.length) {
        alert(`Not enough contestants. ${draftOrder.length} players × ${picksPerPlayer} picks = ${totalPicks} picks, but only ${contestants.length} contestants available.`);
        setBusy(false);
        return;
      }
      const snakeOrder = buildSnakeOrder(draftOrder, picksPerPlayer);
      // Write draft subcollection doc FIRST — if this fails we don't mark the league as active
      await startDraft(currentLeagueId, { order: snakeOrder, timerSeconds, picksPerPlayer });
      // Only update league doc after draft state is confirmed written
      await saveState({ ...appState, draftStatus: 'active', draftSettings: { picksPerPlayer, timerSeconds, draftOrder } });
    } catch (e) {
      console.error("Failed to start draft:", e);
      // Roll back to pending so the commissioner can try again or cancel
      await saveState({ ...appState, draftStatus: 'pending', draftSettings: { picksPerPlayer, timerSeconds, draftOrder } }).catch(() => {});
      alert("Failed to start draft: " + (e?.message || e?.code || "unknown error"));
    }
    setBusy(false);
  };

  const isLive = timerSeconds > 0;
  const totalPicks = draftOrder.length * picksPerPlayer;

  return (
    <div>
      <div style={S.card}>
        <h2 style={S.cardTitle}>Draft Lobby</h2>

        {isCommissioner ? (
          <>
            <p style={{ color: "#A89070", fontSize: 14, marginBottom: 20 }}>
              Configure and start the draft. All league members will see the draft board once it begins.
            </p>

            {/* Draft type indicator */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: "#A89070", fontSize: 12, fontFamily: "'Cinzel',serif", letterSpacing: 1, marginBottom: 8 }}>DRAFT TYPE</p>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { label: "Async", desc: "No timer — players pick at their own pace", value: 0 },
                  { label: "Live (60s)", desc: "60 seconds per pick", value: 60 },
                  { label: "Live (90s)", desc: "90 seconds per pick", value: 90 },
                  { label: "Live (120s)", desc: "2 minutes per pick", value: 120 },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setTimerSeconds(opt.value)}
                    style={{
                      flex: 1,
                      padding: "10px 8px",
                      borderRadius: 8,
                      border: timerSeconds === opt.value ? "1px solid #FF8C42" : "1px solid rgba(255,255,255,0.1)",
                      background: timerSeconds === opt.value ? "rgba(255,140,66,0.12)" : "rgba(255,255,255,0.02)",
                      color: timerSeconds === opt.value ? "#FF8C42" : "#A89070",
                      fontFamily: "'Cinzel',serif",
                      fontSize: 11,
                      cursor: "pointer",
                      letterSpacing: 0.5,
                    }}
                  >{opt.label}</button>
                ))}
              </div>
              <p style={{ color: "#A89070", fontSize: 12, marginTop: 6 }}>
                {timerSeconds === 0
                  ? "Async: picks can be made any time, no countdown."
                  : `Live: ${timerSeconds}s countdown per pick. If time runs out, a random contestant is auto-picked.`}
              </p>
            </div>

            {/* Picks per player */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: "#A89070", fontSize: 12, fontFamily: "'Cinzel',serif", letterSpacing: 1, marginBottom: 8 }}>PICKS PER PLAYER</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={() => setPicksPerPlayer(p => Math.max(1, p - 1))}
                  style={{ ...S.smallBtnGhost, padding: "4px 12px", fontSize: 18, lineHeight: 1 }}
                >−</button>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 24, fontWeight: 700, color: "#FF8C42", minWidth: 32, textAlign: "center" }}>
                  {picksPerPlayer}
                </span>
                <button
                  onClick={() => setPicksPerPlayer(p => Math.min(contestants.length, p + 1))}
                  style={{ ...S.smallBtnGhost, padding: "4px 12px", fontSize: 18, lineHeight: 1 }}
                >+</button>
                <span style={{ color: "#A89070", fontSize: 13 }}>
                  = {totalPicks} total picks ({contestants.length} contestants available)
                </span>
              </div>
            </div>

            {/* Draft order */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ color: "#A89070", fontSize: 12, fontFamily: "'Cinzel',serif", letterSpacing: 1, marginBottom: 8 }}>DRAFT ORDER (SNAKE)</p>
              <div style={{ display: "grid", gap: 6 }}>
                {draftOrder.map((uid, idx) => {
                  const user = appState?.users?.[uid];
                  return (
                    <div key={uid} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
                      <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, color: "#A89070", minWidth: 24 }}>{idx + 1}</span>
                      <span style={{ flex: 1, color: "#E8D5B5" }}>{user?.displayName || uid}</span>
                      <button
                        onClick={() => moveUser(uid, -1)}
                        disabled={idx === 0}
                        style={{ ...S.smallBtnGhost, padding: "2px 8px", opacity: idx === 0 ? 0.3 : 1 }}
                      >↑</button>
                      <button
                        onClick={() => moveUser(uid, 1)}
                        disabled={idx === draftOrder.length - 1}
                        style={{ ...S.smallBtnGhost, padding: "2px 8px", opacity: idx === draftOrder.length - 1 ? 0.3 : 1 }}
                      >↓</button>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => {
                  const shuffled = [...draftOrder].sort(() => Math.random() - 0.5);
                  setDraftOrder(shuffled);
                }}
                style={{ ...S.smallBtnGhost, marginTop: 8, fontSize: 12 }}
              >🎲 Randomize Order</button>
            </div>

            <button
              style={{ ...S.primaryBtn, opacity: busy ? 0.6 : 1 }}
              onClick={handleStart}
              disabled={busy}
            >
              {busy ? "Starting..." : `Start ${isLive ? "Live" : "Async"} Draft`}
            </button>
          </>
        ) : (
          /* Non-commissioner waiting room */
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: 16, color: "#FF8C42", marginBottom: 12 }}>
              Waiting for the commissioner to start the draft...
            </p>
            <p style={{ color: "#A89070", fontSize: 14 }}>
              Stay on this screen. The draft board will appear automatically when it begins.
            </p>
            <div style={{ marginTop: 24, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
              {users.map(([uid, u]) => (
                <div key={uid} style={{ padding: "6px 14px", borderRadius: 20, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E8D5B5", fontSize: 14 }}>
                  {u.displayName}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
