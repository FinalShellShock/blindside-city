import { useState, useEffect, useCallback } from "react";
import { subscribeToDraft, makeDraftPick as fbMakePick } from "../firebase.js";
import { useLeague } from "../contexts/LeagueContext.jsx";

// Build the full snake pick order from a player list and picks-per-player count.
// e.g. 3 players, 2 picks each → [p1,p2,p3,p3,p2,p1]
export function buildSnakeOrder(players, picksPerPlayer) {
  const order = [];
  for (let round = 0; round < picksPerPlayer; round++) {
    const forward = round % 2 === 0;
    const slice = forward ? [...players] : [...players].reverse();
    order.push(...slice);
  }
  return order;
}

export function useDraft(currentUser) {
  const { currentLeagueId, contestants, appState, saveState } = useLeague();
  const [draftState, setDraftState] = useState(null);
  const [draftLoading, setDraftLoading] = useState(true);

  // Subscribe to live draft state via onSnapshot
  useEffect(() => {
    if (!currentLeagueId) return;
    setDraftLoading(true);
    const unsub = subscribeToDraft(currentLeagueId, (data) => {
      setDraftState(data);
      setDraftLoading(false);
    });
    return unsub;
  }, [currentLeagueId]);

  // Which userId should be picking right now
  const currentPickUserId = draftState
    ? (draftState.order[draftState.currentPick] ?? null)
    : null;

  const isMyTurn = !!currentUser && currentPickUserId === currentUser;

  // Contestants not yet picked
  const pickedNames = (draftState?.picks || []).map(p => p.contestant);
  const availableContestants = contestants.filter(c => !pickedNames.includes(c.name));

  // Time remaining (seconds) — calculated client-side from lastPickAt + timerSeconds
  // Returns null when no timer is set (async draft)
  const timerSeconds = draftState?.timerSeconds || 0;
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    if (!draftState || draftState.status !== 'active' || timerSeconds === 0) {
      setTimeRemaining(null);
      return;
    }
    const tick = () => {
      const elapsed = Math.floor((Date.now() - draftState.lastPickAt) / 1000);
      const remaining = Math.max(0, timerSeconds - elapsed);
      setTimeRemaining(remaining);
      return remaining;
    };
    tick();
    const interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, [draftState?.lastPickAt, timerSeconds, draftState?.status]);

  // Auto-pick random contestant when timer hits 0 (live draft only)
  useEffect(() => {
    if (timeRemaining !== 0) return;
    if (!isMyTurn) return;
    if (!availableContestants.length) return;
    const random = availableContestants[Math.floor(Math.random() * availableContestants.length)];
    fbMakePick(currentLeagueId, draftState, currentUser, random.name).then((done) => {
      if (done) finalizeDraft(draftState);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining]);

  const makePick = useCallback(async (contestantName) => {
    if (!isMyTurn || !draftState) return;
    const done = await fbMakePick(currentLeagueId, draftState, currentUser, contestantName);
    if (done) await finalizeDraft(draftState);
  }, [isMyTurn, draftState, currentLeagueId, currentUser]);

  // When draft completes: create/update teams in appState based on picks
  const finalizeDraft = useCallback(async (finalDraftState) => {
    const allPicks = [...(finalDraftState.picks)];
    // Group picks by userId
    const byUser = {};
    allPicks.forEach(p => {
      if (!byUser[p.userId]) byUser[p.userId] = [];
      byUser[p.userId].push(p.contestant);
    });
    // Build teams: one per drafter. Use existing team name if present, else displayName + "'s Team"
    const teams = { ...(appState?.teams || {}) };
    Object.entries(byUser).forEach(([uid, members]) => {
      const displayName = appState?.users?.[uid]?.displayName || uid;
      // Find existing team owned by this user, or create a new key
      const existingEntry = Object.entries(teams).find(([, t]) => t.owner === uid);
      const teamKey = existingEntry ? existingEntry[0] : `${displayName}'s Team`;
      if (existingEntry) delete teams[existingEntry[0]];
      teams[teamKey] = { owner: uid, members, motto: existingEntry?.[1]?.motto || "" };
    });
    await saveState({ ...appState, teams, draftStatus: 'completed' });
  }, [appState, saveState]);

  // Per-user pick roster (for the sidebar)
  const rosterByUser = {};
  (draftState?.picks || []).forEach(p => {
    if (!rosterByUser[p.userId]) rosterByUser[p.userId] = [];
    rosterByUser[p.userId].push(p.contestant);
  });

  return {
    draftState,
    draftLoading,
    isMyTurn,
    currentPickUserId,
    availableContestants,
    timeRemaining,
    makePick,
    rosterByUser,
    picksPerPlayer: draftState?.picksPerPlayer || 0,
  };
}
