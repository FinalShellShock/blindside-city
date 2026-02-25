import { useState, useEffect, useCallback } from "react";
import { loadState, saveStateToDB, subscribeToState } from "./firebase.js";
import { SCORING_RULES, CONTESTANTS, DEFAULT_STATE } from "./gameData.js";
import { globalStyles, S } from "./styles/theme.js";
import { useAuth } from "./contexts/AuthContext.jsx";
import { useScoring } from "./hooks/useScoring.js";
import { TorchIcon } from "./components/shared/Icons.jsx";
import FireParticles from "./components/shared/FireParticles.jsx";
import DevPanel, { useDevMode } from "./components/shared/DevPanel.jsx";
import LoginScreen from "./components/auth/LoginScreen.jsx";
import RegisterScreen from "./components/auth/RegisterScreen.jsx";
import MigrationScreen from "./components/auth/MigrationScreen.jsx";
import HomeView from "./components/home/HomeView.jsx";
import MyTeamView from "./components/team/MyTeamView.jsx";
import ScoreboardView from "./components/scoreboard/ScoreboardView.jsx";
import CastView from "./components/cast/CastView.jsx";
import CommissionerPanel from "./components/commissioner/CommissionerPanel.jsx";

// ── Elimination helpers (shared across the app) ──
export function normEliminated(eliminated) {
  return (eliminated || []).map(e => typeof e === "string" ? { name: e, episode: null } : e);
}
export function isElim(eliminated, name) {
  return normEliminated(eliminated).some(e => e.name === name);
}
export function elimEpisode(eliminated, name) {
  return normEliminated(eliminated).find(e => e.name === name)?.episode || null;
}

function App() {
  const devMode = useDevMode();
  const { firebaseUser, userProfile, loading: authLoading, logOut } = useAuth();

  const [appState, setAppState] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [view, setView] = useState("home");
  const [authScreen, setAuthScreen] = useState("login"); // "login" | "register"
  const [commishTab, setCommishTab] = useState("scoring");
  const [eventForm, setEventForm] = useState({ contestants: [], event: "", episode: 1 });
  const [episodeRecap, setEpisodeRecap] = useState({ episode: 1, text: "" });

  // Load Firestore data
  useEffect(() => {
    let unsubscribe;
    async function init() {
      try {
        const initial = await loadState();
        setAppState(initial || DEFAULT_STATE);
        unsubscribe = subscribeToState((ns) => setAppState(ns));
      } catch (err) {
        console.error("Firebase load error:", err);
        setAppState(DEFAULT_STATE);
      }
      setDataLoading(false);
    }
    init();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const saveState = useCallback(async (ns) => {
    setAppState(ns);
    try { await saveStateToDB(ns); }
    catch (e) { console.error("Save failed:", e); }
  }, []);

  // The user key used in appState.users / appState.commissioners / appState.teams.
  // Migrated users keep their old username key; new Firebase users use their UID.
  const currentUser = userProfile?.migratedFrom ?? firebaseUser?.uid ?? null;

  const isUserCommissioner = currentUser && (appState?.commissioners || []).includes(currentUser);
  const getUserTeam = (u) => Object.entries(appState?.teams || {}).find(([_, t]) => t.owner === u);

  const getEffectiveTribe = (name) => {
    const overrides = appState?.tribeOverrides || {};
    return overrides[name] || CONTESTANTS.find(c => c.name === name)?.tribe || "Unknown";
  };

  // Scoring — uses the extracted hook
  const { contestantScores, teamScores, sortedTeams } = useScoring(
    appState?.episodes || [],
    appState?.teams || {},
  );

  // ── Commissioner actions ──
  const addEvent = async () => {
    if (!eventForm.contestants.length || !eventForm.event) return;
    const eps = [...(appState.episodes || [])];
    let ep = eps.find(e => e.number === eventForm.episode);
    if (!ep) { ep = { number: eventForm.episode, events: [], recap: "" }; eps.push(ep); }
    eventForm.contestants.forEach(c => ep.events.push({ contestant: c, type: eventForm.event }));
    eps.sort((a, b) => a.number - b.number);
    await saveState({ ...appState, episodes: eps });
    setEventForm({ ...eventForm, contestants: [], event: "" });
  };

  const removeEvent = async (en, ei) => {
    const eps = [...(appState.episodes || [])];
    const ep = eps.find(e => e.number === en);
    if (ep) { ep.events.splice(ei, 1); await saveState({ ...appState, episodes: eps }); }
  };

  const saveRecap = async () => {
    const eps = [...(appState.episodes || [])];
    let ep = eps.find(e => e.number === episodeRecap.episode);
    if (!ep) { ep = { number: episodeRecap.episode, events: [], recap: "" }; eps.push(ep); }
    ep.recap = episodeRecap.text;
    eps.sort((a, b) => a.number - b.number);
    await saveState({ ...appState, episodes: eps });
  };

  const confirmEliminate = async (name, episode) => {
    const current = normEliminated(appState.eliminated);
    current.push({ name, episode: parseInt(episode) || null });
    await saveState({ ...appState, eliminated: current });
  };

  const unEliminate = async (name) => {
    const current = normEliminated(appState.eliminated).filter(e => e.name !== name);
    await saveState({ ...appState, eliminated: current });
  };

  const setContestantTribe = async (contestantName, newTribe) => {
    const overrides = { ...(appState.tribeOverrides || {}) };
    const original = CONTESTANTS.find(c => c.name === contestantName)?.tribe;
    if (newTribe === original) { delete overrides[contestantName]; }
    else { overrides[contestantName] = newTribe; }
    await saveState({ ...appState, tribeOverrides: overrides });
  };

  const addReaction = async (episodeNum, target, emoji) => {
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
    if (myIdx >= 0) { users.splice(myIdx, 1); }
    else { users.push(currentUser); }
    reactionField[emoji] = users;
    await saveState({ ...appState, episodes: eps });
  };

  // ── Computed feed data ──
  const eliminated = appState?.eliminated || [];
  const tribeOverrides = appState?.tribeOverrides || {};

  const feedEpisodes = (() => {
    const feed = [...(appState?.episodes || [])]
      .filter(ep => ep.recap || (ep.events || []).length > 0 || normEliminated(eliminated).some(e => e.episode === ep.number))
      .sort((a, b) => b.number - a.number);
    normEliminated(eliminated).filter(e => e.episode).forEach(elim => {
      if (!feed.find(ep => ep.number === elim.episode)) {
        feed.push({ number: elim.episode, events: [], recap: "" });
      }
    });
    feed.sort((a, b) => b.number - a.number);
    return feed;
  })();

  const myTeam = getUserTeam(currentUser);

  // ── Loading screen (auth or data not ready yet) ──
  if (authLoading || dataLoading) {
    return (
      <div style={S.loadingScreen}>
        <style>{globalStyles}</style>
        <TorchIcon size={64}/>
        <p style={{ color: "#FF8C42", fontFamily: "'Cinzel',serif", marginTop: 16, fontSize: 18 }}>Loading...</p>
      </div>
    );
  }

  // ── Migration screen: legacy user with no Firebase session ──
  const legacyKey = localStorage.getItem("bc_user");
  if (legacyKey && !firebaseUser && !devMode) {
    const legacyUser = appState?.users?.[legacyKey];
    return (
      <MigrationScreen
        legacyUsername={legacyKey}
        legacyDisplayName={legacyUser?.displayName || legacyKey}
        onComplete={() => {
          // MigrationScreen already removed bc_user from localStorage
        }}
      />
    );
  }

  // ── Auth screens: not logged in and not a legacy user ──
  if (!firebaseUser && !devMode) {
    if (authScreen === "register") {
      return <RegisterScreen onSwitchToLogin={() => setAuthScreen("login")} />;
    }
    return <LoginScreen onSwitchToRegister={() => setAuthScreen("register")} />;
  }

  // ── Dev mode login bypass ──
  if (!firebaseUser && devMode) {
    return (
      <div style={S.loginScreen}>
        <style>{globalStyles}</style>
        <FireParticles/>
        <div style={{ ...S.loginCard, maxWidth: 600 }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <TorchIcon size={48}/>
            <h1 style={S.title}>BLINDSIDE ISLAND</h1>
            <p style={S.subtitle}>DEV MODE ACTIVE</p>
          </div>
          <DevPanel appState={appState} saveState={saveState} setCurrentUser={() => {}} currentUser={currentUser}/>
        </div>
      </div>
    );
  }

  // Resolve display name: prefer appState.users entry (legacy), else userProfile
  const displayName = appState?.users?.[currentUser]?.displayName || userProfile?.displayName || "Player";

  // ── Main app ──
  return (
    <div style={S.appContainer}>
      <style>{globalStyles}</style>
      <FireParticles/>

      <header style={S.header}>
        <div style={S.headerLeft}>
          <TorchIcon size={28}/>
          <div>
            <h1 style={S.headerTitle}>{appState.leagueName}</h1>
            <p style={S.headerSub}>Season 50</p>
          </div>
        </div>
        <div style={S.headerRight}>
          <span style={S.userName}>{displayName}</span>
          {isUserCommissioner && <span style={S.commBadge}>COMMISH</span>}
          {devMode && <span style={{ ...S.commBadge, background: "rgba(74,222,128,0.2)", color: "#4ADE80" }}>DEV</span>}
          <button style={S.logoutBtn} onClick={async () => {
            localStorage.removeItem("bc_user");
            await logOut();
          }}>Logout</button>
        </div>
      </header>

      <nav style={S.nav}>
        {[
          { id: "home",        label: "Home" },
          { id: "myteam",      label: "My Team" },
          { id: "leaderboard", label: "Scoreboard" },
          { id: "castStatus",  label: "Cast" },
          { id: "rules",       label: "Rules" },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setView(id)} style={{ ...S.navBtn, ...(view === id ? S.navBtnActive : {}) }}>
            {label}
          </button>
        ))}
        {(isUserCommissioner || devMode) && (
          <button onClick={() => setView("admin")} style={{ ...S.navBtn, ...(view === "admin" ? S.navBtnActive : {}), color: "#FF6B35" }}>
            Commissioner
          </button>
        )}
      </nav>

      <main style={S.main}>
        {devMode && (
          <DevPanel appState={appState} saveState={saveState} setCurrentUser={() => {}} currentUser={currentUser}/>
        )}

        {view === "home" && (
          <HomeView
            appState={appState}
            currentUser={currentUser}
            sortedTeams={sortedTeams}
            feedEpisodes={feedEpisodes}
            myTeam={myTeam}
            eliminated={eliminated}
            addReaction={addReaction}
            getEffectiveTribe={getEffectiveTribe}
          />
        )}

        {view === "myteam" && (
          <MyTeamView
            appState={appState}
            currentUser={currentUser}
            myTeam={myTeam}
            contestantScores={contestantScores}
            teamScores={teamScores}
            eliminated={eliminated}
            tribeOverrides={tribeOverrides}
            getEffectiveTribe={getEffectiveTribe}
            isUserCommissioner={isUserCommissioner}
            saveState={saveState}
          />
        )}

        {view === "leaderboard" && (
          <ScoreboardView
            appState={appState}
            sortedTeams={sortedTeams}
            teamScores={teamScores}
            eliminated={eliminated}
            getEffectiveTribe={getEffectiveTribe}
          />
        )}

        {view === "castStatus" && (
          <CastView
            appState={appState}
            contestantScores={contestantScores}
            eliminated={eliminated}
            tribeOverrides={tribeOverrides}
            getEffectiveTribe={getEffectiveTribe}
          />
        )}

        {view === "rules" && (
          <div style={S.card}>
            <h2 style={S.cardTitle}>Scoring Rules</h2>
            <div style={{ display: "grid", gap: 8 }}>
              {Object.entries(SCORING_RULES).map(([k, r]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 8, borderLeft: `3px solid ${r.points >= 0 ? "#4ADE80" : "#F87171"}` }}>
                  <span style={{ color: "#E8D5B5" }}>{r.label}</span>
                  <span style={{ fontWeight: 700, fontSize: 18, fontFamily: "'Cinzel',serif", color: r.points >= 0 ? "#4ADE80" : "#F87171" }}>{r.points > 0 ? "+" : ""}{r.points}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "admin" && (isUserCommissioner || devMode) && (
          <CommissionerPanel
            appState={appState}
            currentUser={currentUser}
            saveState={saveState}
            setCurrentUser={() => {}}
            setView={setView}
            commishTab={commishTab}
            setCommishTab={setCommishTab}
            eventForm={eventForm}
            setEventForm={setEventForm}
            addEvent={addEvent}
            removeEvent={removeEvent}
            episodeRecap={episodeRecap}
            setEpisodeRecap={setEpisodeRecap}
            saveRecap={saveRecap}
            eliminated={eliminated}
            tribeOverrides={tribeOverrides}
            getEffectiveTribe={getEffectiveTribe}
            confirmEliminate={confirmEliminate}
            unEliminate={unEliminate}
            setContestantTribe={setContestantTribe}
          />
        )}
      </main>
    </div>
  );
}

export default App;
