import { useState, useEffect } from "react";
import { globalStyles, S } from "./styles/theme.js";
import { useAuth } from "./contexts/AuthContext.jsx";
import { useLeague } from "./contexts/LeagueContext.jsx";
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
import DraftLobby from "./components/draft/DraftLobby.jsx";
import DraftBoard from "./components/draft/DraftBoard.jsx";
import AccountPanel from "./components/account/AccountPanel.jsx";
import HelpPanel from "./components/shared/HelpPanel.jsx";

const STOCK_AVATARS = Array.from({ length: 8 }, (_, i) => `/avatars/avatar${i + 1}.png`);
function randomAvatar() { return STOCK_AVATARS[Math.floor(Math.random() * STOCK_AVATARS.length)]; }

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
  const { firebaseUser, userProfile, loading: authLoading, logOut, updateProfile } = useAuth();
  const { appState, loading: dataLoading, saveState, effectiveScoringRules, currentLeagueId, refreshUserLeagues, userLeagues, leaguesLoaded } = useLeague();

  const [view, setView] = useState("home");
  const [authScreen, setAuthScreen] = useState("login"); // "login" | "register"
  const [commishTab, setCommishTab] = useState("scoring");
  const [eventForm, setEventForm] = useState({ contestants: [], event: "", episode: 1 });
  const [episodeRecap, setEpisodeRecap] = useState({ episode: 1, text: "" });
  // Dev-mode user impersonation override (null = use the real derived currentUser)
  const [devUserOverride, setDevUserOverride] = useState(null);
  // Show join/create overlay from within the app (via LeagueSwitcher dropdown)
  const [showJoinCreate, setShowJoinCreate] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // The user key used in appState.users / appState.commissioners / appState.teams.
  // Migrated users keep their old username key; new Firebase users use their UID.
  // In dev mode, setDevUserOverride lets you impersonate any user in appState.
  const derivedCurrentUser = userProfile?.migratedFrom ?? firebaseUser?.uid ?? null;
  const currentUser = (devMode && devUserOverride) ? devUserOverride : derivedCurrentUser;

  const isUserCommissioner = currentUser && (appState?.commissioners || []).includes(currentUser);
  const myTeam = Object.entries(appState?.teams || {}).find(([_, t]) => t.owner === currentUser);
  const displayName = userProfile?.displayName || appState?.users?.[currentUser]?.displayName || "Player";

  // Assign a random avatar to users who don't have one yet
  useEffect(() => {
    if (firebaseUser && userProfile && !userProfile.avatar) {
      updateProfile({ avatar: randomAvatar() });
    }
  }, [firebaseUser, userProfile]);

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
        <img src="/logo.png" alt="Blindside Island" style={{ height: 80 }}/>
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
            <img src="/logo.png" alt="Blindside Island" style={{ height: 80, marginBottom: 8 }}/>
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
  // Also catch stale localStorage leagueIds pointing at deleted/nonexistent leagues:
  // if appState loaded but has no users map, treat it as no league.
  const isLegacyUser = !!userProfile?.migratedFrom || !!legacyKey;
  const leagueIsReal = isLegacyUser || userLeagues.length > 0 || (appState?.users && Object.keys(appState.users).length > 0);
  if ((!leagueIsReal || showJoinCreate) && !devMode) {
    return (
      <JoinCreateLeague
        firebaseUid={firebaseUser?.uid}
        currentUser={currentUser}
        displayName={displayName}
        onBack={leagueIsReal ? () => setShowJoinCreate(false) : null}
      />
    );
  }

  // ── Main app ──
  return (
    <div style={S.appContainer}>
      <style>{globalStyles}</style>
      <FireParticles/>

      <header style={S.header}>
        <div style={S.headerLeft}>
          <img src="/logo.png" alt="Blindside Island" style={{ height: 52, width: "auto" }}/>
          <LeagueSwitcher onJoinCreate={() => setShowJoinCreate(true)} />
        </div>
        <div style={S.headerRight}>
          <EpisodeSelector/>
          {userProfile?.avatar && (
            <img
              src={userProfile.avatar}
              alt="avatar"
              style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255,140,66,0.3)", cursor: "pointer" }}
              onClick={() => setShowAccount(true)}
            />
          )}
          <span
            style={{ ...S.userName, cursor: "pointer", textDecoration: "underline", textDecorationColor: "rgba(255,140,66,0.4)" }}
            onClick={() => setShowAccount(true)}
          >{displayName}</span>
          {isUserCommissioner && <span style={S.commBadge}>COMMISH</span>}
          {devMode && <span style={{ ...S.commBadge, background: "rgba(74,222,128,0.2)", color: "#4ADE80" }}>DEV</span>}
          <button
            onClick={() => setShowHelp(true)}
            title="Help"
            style={{ ...S.logoutBtn, fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 13 }}
          >?</button>
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
        {/* Draft tab — visible to all when a draft is pending/active/completed */}
        {["pending", "active", "completed"].includes(appState?.draftStatus) && (
          <button
            onClick={() => setView("draft")}
            style={{
              ...S.navBtn,
              ...(view === "draft" ? S.navBtnActive : {}),
              // Only override color when draft is active (yellow dot) and tab is NOT currently selected
              ...(appState?.draftStatus === "active" && view !== "draft" ? { color: "#FFD93D" } : {}),
            }}
          >
            {appState?.draftStatus === "active" ? "● Draft" : "Draft"}
          </button>
        )}
        {(isUserCommissioner || devMode) && (
          <button onClick={() => setView("admin")} style={{ ...S.navBtn, ...(view === "admin" ? S.navBtnActive : {}), color: "#FF6B35" }}>
            Commissioner
          </button>
        )}
      </nav>

      {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}

      {showAccount && (
        <AccountPanel
          onClose={() => setShowAccount(false)}
          onSave={async ({ displayName: dn, avatar }) => {
            if (!currentUser || !appState?.users?.[currentUser]) return;
            const updatedUsers = {
              ...appState.users,
              [currentUser]: { ...appState.users[currentUser], displayName: dn, avatar },
            };
            await saveState({ ...appState, users: updatedUsers });
          }}
        />
      )}

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

        {view === "draft" && (
          appState?.draftStatus === "pending"
            ? <DraftLobby currentUser={currentUser} isCommissioner={isUserCommissioner || devMode} />
            : <DraftBoard currentUser={currentUser} isCommissioner={isUserCommissioner || devMode} />
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

      <footer style={{ textAlign: "center", padding: "24px 16px", borderTop: "1px solid rgba(255,140,66,0.08)", marginTop: 8 }}>
        <p style={{ color: "#4A3828", fontSize: 12, fontFamily: "'Cinzel',serif", letterSpacing: 1 }}>
          © {new Date().getFullYear()} Blindside Island. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;
