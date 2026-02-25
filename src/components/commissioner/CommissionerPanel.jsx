import { S } from "../../styles/theme.js";
import ScoringTab from "./ScoringTab.jsx";
import RecapsTab from "./RecapsTab.jsx";
import CastTribesTab from "./CastTribesTab.jsx";
import ToolsTab from "./ToolsTab.jsx";

const COMMISH_TABS = [
  { id: "scoring",  label: "Update Scoring" },
  { id: "recaps",   label: "Episode Recaps" },
  { id: "cast",     label: "Cast & Tribes" },
  { id: "tools",    label: "Tools" },
];

export default function CommissionerPanel({
  appState,
  currentUser,
  saveState,
  setCurrentUser,
  setView,
  commishTab,
  setCommishTab,
  eventForm,
  setEventForm,
  addEvent,
  removeEvent,
  episodeRecap,
  setEpisodeRecap,
  saveRecap,
  eliminated,
  tribeOverrides,
  getEffectiveTribe,
  confirmEliminate,
  unEliminate,
  setContestantTribe,
}) {
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
      {/* Sidebar (desktop) */}
      <div className="commish-sidebar" style={S.commishSidebar}>
        {COMMISH_TABS.map(t => (
          <button key={t.id} onClick={() => setCommishTab(t.id)} style={{ ...S.commishSideBtn, ...(commishTab === t.id ? S.commishSideBtnActive : {}) }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Mobile tabs */}
      <div className="commish-mobile-tabs" style={S.commishMobileTabs}>
        {COMMISH_TABS.map(t => (
          <button key={t.id} onClick={() => setCommishTab(t.id)} style={{ ...S.commishMobileTab, ...(commishTab === t.id ? S.commishMobileTabActive : {}) }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {commishTab === "scoring" && (
          <ScoringTab
            appState={appState}
            eventForm={eventForm}
            setEventForm={setEventForm}
            addEvent={addEvent}
            removeEvent={removeEvent}
            eliminated={eliminated}
            getEffectiveTribe={getEffectiveTribe}
          />
        )}
        {commishTab === "recaps" && (
          <RecapsTab
            appState={appState}
            episodeRecap={episodeRecap}
            setEpisodeRecap={setEpisodeRecap}
            saveRecap={saveRecap}
          />
        )}
        {commishTab === "cast" && (
          <CastTribesTab
            appState={appState}
            eliminated={eliminated}
            tribeOverrides={tribeOverrides}
            getEffectiveTribe={getEffectiveTribe}
            confirmEliminate={confirmEliminate}
            unEliminate={unEliminate}
            setContestantTribe={setContestantTribe}
          />
        )}
        {commishTab === "tools" && (
          <ToolsTab
            appState={appState}
            currentUser={currentUser}
            saveState={saveState}
            setCurrentUser={setCurrentUser}
            setView={setView}
            eliminated={eliminated}
            getEffectiveTribe={getEffectiveTribe}
          />
        )}
      </div>
    </div>
  );
}
