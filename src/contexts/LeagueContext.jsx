import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { loadState, saveStateToDB, subscribeToState, createLeague, joinLeagueByCode, getUserLeagues, regenerateInviteCode } from "../firebase.js";
import { CONTESTANTS, TRIBE_COLORS, DEFAULT_STATE, SCORING_RULES } from "../gameData.js";
import { useScoring } from "../hooks/useScoring.js";

const WATCHED_KEY = "bc_watched_through";
const LEAGUE_KEY = "bc_league_id";

const LeagueContext = createContext(null);

export function LeagueProvider({ children }) {
  const [appState, setAppState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLeagueId, setCurrentLeagueIdState] = useState(() => {
    return localStorage.getItem(LEAGUE_KEY) || "main";
  });
  const [userLeagues, setUserLeagues] = useState([]); // [{ id, name, role }]
  const [leaguesLoaded, setLeaguesLoaded] = useState(false);

  // 0 = haven't watched anything yet, 999 = fully caught up (no spoiler filter)
  const [watchedThrough, setWatchedThroughState] = useState(() => {
    const saved = localStorage.getItem(WATCHED_KEY);
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const setWatchedThrough = useCallback((ep) => {
    setWatchedThroughState(ep);
    localStorage.setItem(WATCHED_KEY, String(ep));
  }, []);

  const setCurrentLeagueId = useCallback((id) => {
    setCurrentLeagueIdState(id);
    localStorage.setItem(LEAGUE_KEY, id);
    // Reset spoiler protection when switching leagues
    setWatchedThroughState(0);
    localStorage.setItem(WATCHED_KEY, "0");
  }, []);

  useEffect(() => {
    let unsubscribe;
    async function init() {
      try {
        const initial = await loadState(currentLeagueId);
        setAppState(initial || DEFAULT_STATE);
        unsubscribe = subscribeToState((ns) => setAppState(ns), currentLeagueId);
      } catch (err) {
        console.error("Firebase load error:", err);
        setAppState(DEFAULT_STATE);
      }
      setLoading(false);
    }
    setLoading(true);
    setAppState(null);
    init();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [currentLeagueId]);

  const saveState = useCallback(async (ns) => {
    setAppState(ns);
    try { await saveStateToDB(ns, currentLeagueId); }
    catch (e) { console.error("Save failed:", e); }
  }, [currentLeagueId]);

  // ── League management actions ──
  const refreshUserLeagues = useCallback(async (uid) => {
    if (!uid) { setLeaguesLoaded(true); return; }
    try {
      const leagues = await getUserLeagues(uid);
      setUserLeagues(leagues);
    } catch (e) {
      console.error("Failed to load user leagues:", e);
    } finally {
      setLeaguesLoaded(true);
    }
  }, []);

  const createNewLeague = useCallback(async (uid, displayName, leagueName) => {
    const leagueId = await createLeague(uid, displayName, leagueName, DEFAULT_STATE);
    await refreshUserLeagues(uid);
    setCurrentLeagueId(leagueId);
    return leagueId;
  }, [refreshUserLeagues, setCurrentLeagueId]);

  const joinLeague = useCallback(async (uid, displayName, inviteCode) => {
    const leagueId = await joinLeagueByCode(uid, displayName, inviteCode);
    if (!leagueId) return null;
    await refreshUserLeagues(uid);
    setCurrentLeagueId(leagueId);
    return leagueId;
  }, [refreshUserLeagues, setCurrentLeagueId]);

  const regenInviteCode = useCallback(async () => {
    const newCode = await regenerateInviteCode(currentLeagueId, appState?.inviteCode);
    setAppState(prev => ({ ...prev, inviteCode: newCode }));
    return newCode;
  }, [currentLeagueId, appState?.inviteCode]);

  // ── Derived state ──
  // eliminated = raw list from Firestore (all episodes)
  // visibleEliminated = filtered by watchedThrough (exposed to views as `eliminated`)
  const eliminated = appState?.eliminated || [];
  const tribeOverrides = appState?.tribeOverrides || {};

  // contestants/tribeColors: use league-specific data if present, fall back to game defaults
  // This ensures leagues/main (no seeded data) and any pre-Phase-7 league still work.
  const contestants = appState?.contestants || CONTESTANTS;
  const tribeColors = appState?.tribeColors || TRIBE_COLORS;

  const getEffectiveTribe = useCallback((name) => {
    return tribeOverrides[name] || contestants.find(c => c.name === name)?.tribe || "Unknown";
  }, [tribeOverrides, contestants]);

  // Merge commissioner point overrides with defaults, then append any custom rules.
  // Custom rules are stored as appState.customRules: [{ id, label, points }]
  const effectiveScoringRules = useMemo(() => {
    const overrides = appState?.scoringRules || {};
    const merged = {};
    Object.entries(SCORING_RULES).forEach(([k, r]) => {
      merged[k] = overrides[k] !== undefined ? { ...r, points: overrides[k] } : r;
    });
    (appState?.customRules || []).forEach(r => {
      merged[r.id] = { label: r.label, points: r.points, custom: true };
    });
    return merged;
  }, [appState?.scoringRules, appState?.customRules]);

  const { contestantScores, teamScores, sortedTeams } = useScoring(
    appState?.episodes || [],
    appState?.teams || {},
    effectiveScoringRules,
    watchedThrough,
    contestants,
  );

  // Only show eliminations that happened in episodes the user has watched
  const visibleEliminated = watchedThrough === 999
    ? eliminated
    : eliminated.filter(e => {
        const obj = typeof e === "string" ? { name: e, episode: null } : e;
        return obj.episode === null || obj.episode <= watchedThrough;
      });

  const feedEpisodes = (() => {
    if (!appState) return [];
    const normElim = visibleEliminated.map(e => typeof e === "string" ? { name: e, episode: null } : e);
    // Only show episodes at or before watchedThrough
    const visibleEps = (appState.episodes || []).filter(ep => watchedThrough === 999 || ep.number <= watchedThrough);
    const feed = [...visibleEps]
      .filter(ep => ep.recap || (ep.events || []).length > 0 || normElim.some(e => e.episode === ep.number))
      .sort((a, b) => b.number - a.number);
    normElim.filter(e => e.episode).forEach(elim => {
      if (!feed.find(ep => ep.number === elim.episode)) {
        feed.push({ number: elim.episode, events: [], recap: "" });
      }
    });
    feed.sort((a, b) => b.number - a.number);
    return feed;
  })();

  // ── Actions ──
  const addEvent = useCallback(async (eventForm) => {
    if (!eventForm.contestants.length || !eventForm.event) return;
    const eps = [...(appState.episodes || [])];
    let ep = eps.find(e => e.number === eventForm.episode);
    if (!ep) { ep = { number: eventForm.episode, events: [], recap: "" }; eps.push(ep); }
    eventForm.contestants.forEach(c => ep.events.push({ contestant: c, type: eventForm.event }));
    eps.sort((a, b) => a.number - b.number);
    await saveState({ ...appState, episodes: eps });
  }, [appState, saveState]);

  const removeEvent = useCallback(async (episodeNum, eventIdx) => {
    const eps = [...(appState.episodes || [])];
    const ep = eps.find(e => e.number === episodeNum);
    if (ep) { ep.events.splice(eventIdx, 1); await saveState({ ...appState, episodes: eps }); }
  }, [appState, saveState]);

  const saveRecap = useCallback(async (episodeRecap) => {
    const eps = [...(appState.episodes || [])];
    let ep = eps.find(e => e.number === episodeRecap.episode);
    if (!ep) { ep = { number: episodeRecap.episode, events: [], recap: "" }; eps.push(ep); }
    ep.recap = episodeRecap.text;
    eps.sort((a, b) => a.number - b.number);
    await saveState({ ...appState, episodes: eps });
  }, [appState, saveState]);

  const confirmEliminate = useCallback(async (name, episode) => {
    const normElim = (appState.eliminated || []).map(e => typeof e === "string" ? { name: e, episode: null } : e);
    normElim.push({ name, episode: parseInt(episode) || null });
    await saveState({ ...appState, eliminated: normElim });
  }, [appState, saveState]);

  const unEliminate = useCallback(async (name) => {
    const normElim = (appState.eliminated || []).map(e => typeof e === "string" ? { name: e, episode: null } : e).filter(e => e.name !== name);
    await saveState({ ...appState, eliminated: normElim });
  }, [appState, saveState]);

  const setContestantTribe = useCallback(async (contestantName, newTribe) => {
    const overrides = { ...(appState.tribeOverrides || {}) };
    const original = CONTESTANTS.find(c => c.name === contestantName)?.tribe;
    if (newTribe === original) { delete overrides[contestantName]; }
    else { overrides[contestantName] = newTribe; }
    await saveState({ ...appState, tribeOverrides: overrides });
  }, [appState, saveState]);

  const addReaction = useCallback(async (currentUser, episodeNum, target, emoji) => {
    if (!currentUser) return;
    const eps = [...(appState.episodes || [])];
    let ep = eps.find(e => e.number === episodeNum);
    if (!ep) return;
    ep = { ...ep };
    eps[eps.findIndex(e => e.number === episodeNum)] = ep;
    let reactionField;
    if (target === "recap") {
      ep.recapReactions = { ...(ep.recapReactions || {}) };
      reactionField = ep.recapReactions;
    } else if (target === "elimination") {
      ep.eliminationReactions = { ...(ep.eliminationReactions || {}) };
      reactionField = ep.eliminationReactions;
    } else {
      const idx = target.replace("event_", "");
      ep.eventReactions = { ...(ep.eventReactions || {}) };
      ep.eventReactions[idx] = { ...(ep.eventReactions[idx] || {}) };
      reactionField = ep.eventReactions[idx];
    }
    const users = [...(reactionField[emoji] || [])];
    const myIdx = users.indexOf(currentUser);
    if (myIdx >= 0) { users.splice(myIdx, 1); } else { users.push(currentUser); }
    reactionField[emoji] = users;
    await saveState({ ...appState, episodes: eps });
  }, [appState, saveState]);

  return (
    <LeagueContext.Provider value={{
      appState,
      loading,
      saveState,
      // league management
      currentLeagueId,
      setCurrentLeagueId,
      userLeagues,
      leaguesLoaded,
      refreshUserLeagues,
      createNewLeague,
      joinLeague,
      regenInviteCode,
      // spoiler protection
      watchedThrough,
      setWatchedThrough,
      // derived (eliminated is filtered by watchedThrough for views)
      effectiveScoringRules,
      contestants,
      tribeColors,
      eliminated: visibleEliminated,
      tribeOverrides,
      getEffectiveTribe,
      contestantScores,
      teamScores,
      sortedTeams,
      feedEpisodes,
      // actions (use raw `eliminated` for writes so we don't lose unaired data)
      addEvent,
      removeEvent,
      saveRecap,
      confirmEliminate,
      unEliminate,
      setContestantTribe,
      addReaction,
    }}>
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeague() {
  return useContext(LeagueContext);
}
