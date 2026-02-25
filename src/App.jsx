import { useState, useEffect } from "react";
import { globalStyles, S } from "./styles/theme.js";
import { useAuth } from "./contexts/AuthContext.jsx";
import { useLeague } from "./contexts/LeagueContext.jsx";
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
import EpisodeSelector from "./components/shared/EpisodeSelector.jsx";
import LeagueSwitcher from "./components/shared/LeagueSwitcher.jsx";
import JoinCreateLeague from "./components/league/JoinCreateLeague.jsx";

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
  const { appState, loading: dataLoading, saveState, effectiveScoringRules, currentLeagueId, refreshUserLeagues, userLeagues, leaguesLoaded } = useLeague();

  const [view, setView] = useState("home");
  const [authScreen, setAuthScreen] = useState("login"); // "login" | "register"
  const [commishTab, setCommishTab] = useState("scoring");
  const [eventForm, setEventForm] = useState({ contestants: [], event: "", episode: 1 });
  const [episodeRecap, setEpisodeRecap] = useState({ episode: 1, text: "" });
  // Dev-mode user impersonation override (null = use the real derived currentUser)
  const [devUserOverride, setDevUserOverride] = useState(null);

  // The user key used in appState.users / appState.commissioners / appState.teams.
  // Migrated users keep their old username key; new Firebase users use their UID.
  // In dev mode, setDevUserOverride lets you impersonate any user in appState.
  const derivedCurrentUser = userProfile?.migratedFrom ?? firebaseUser?.uid ?? null;
  const currentUser = (devMode && devUserOverride) ? devUserOverride : derivedCurrentUser;

  const isUserCommissioner = currentUser && (appState?.commissioners || []).includes(currentUser);
  const myTeam = Object.entries(appState?.teams || {}).find(([_, t]) => t.owner === currentUser);
  const displayName = userProfile?.displayName || appState?.users?.[currentUser]?.displayName || "Player";

  // Load the user's league list whenever the real (non-impersonated) user resolves.
  // Always calling refreshUserLeagues ensures leaguesLoaded gets set even when
  // derivedCurrentUser is null (logged out / auth still settling), preventing a hang.
  useEffect(() => {
    refreshUserLeagues(derivedCurrentUser);
  }, [derivedCurrentUser, refreshUserLeagues]);

  // ── Loading screen ──
  if (authLoading || dataLoading || (currentUser && !leaguesLoaded)) {
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
        onComplete={() => {}}
      />
    );
  }

  // ── Auth screens ──
  if (!firebaseUser && !devMode) {
    if (authScreen === "register") {
      return <RegisterScreen onSwitchToLogin={() => setAuthScreen("login")} />;
    }
    return <LoginScreen onSwitchToRegister={() => setAuthScreen("register")} />;
  }

  // ── Dev mode without login ──
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
          <DevPanel appState={appState} saveState={saveState} setCurrentUser={setDevUserOverride} currentUser={currentUser}/>
        </div>
      </div>
    );
  }

  // ── New user with no league: show join/create splash ──
  // A legacy user always lands on "main". A brand-new Firebase user with no leagues
  // and no legacy key should pick or create a league before entering the app.
  const isLegacyUser = !!userProfile?.migratedFrom || !!legacyKey;
  const hasLeague = isLegacyUser || currentLeagueId !== "main" || userLeagues.length > 0;
  if (!hasLeague && !devMode) {
    return (
      <JoinCreateLeague currentUser={currentUser} displayName={displayName} />
    );
  }

  // ── Main app ──
  return (
    <div style={S.appContainer}>
      <style>{globalStyles}</style>
      <FireParticles/>

      <header style={S.header}>
        <div style={S.headerLeft}>
          <TorchIcon size={28}/>
          <div>
            <LeagueSwitcher currentUser={currentUser} displayName={displayName} />
            <p style={S.headerSub}>Season 50</p>
          </div>
        </div>
        <div style={S.headerRight}>
          <EpisodeSelector/>
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
          <DevPanel appState={appState} saveState={saveState} setCurrentUser={setDevUserOverride} currentUser={currentUser}/>
        )}

        {view === "home" && <HomeView currentUser={currentUser} myTeam={myTeam}/>}

        {view === "myteam" && (
          <MyTeamView
            currentUser={currentUser}
            myTeam={myTeam}
            isUserCommissioner={isUserCommissioner}
          />
        )}

        {view === "leaderboard" && <ScoreboardView/>}

        {view === "castStatus" && <CastView/>}

        {view === "rules" && (
          <div style={S.card}>
            <h2 style={S.cardTitle}>Scoring Rules</h2>
            <div style={{ display: "grid", gap: 8 }}>
              {Object.entries(effectiveScoringRules).map(([k, r]) => (
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
            currentUser={currentUser}
            setView={setView}
            commishTab={commishTab}
            setCommishTab={setCommishTab}
            eventForm={eventForm}
            setEventForm={setEventForm}
            episodeRecap={episodeRecap}
            setEpisodeRecap={setEpisodeRecap}
          />
        )}
      </main>
    </div>
  );
}

export default App;
