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
  currentUser,
  setView,
  commishTab,
  setCommishTab,
  eventForm,
  setEventForm,
  episodeRecap,
  setEpisodeRecap,
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
          <ScoringTab eventForm={eventForm} setEventForm={setEventForm}/>
        )}
        {commishTab === "recaps" && (
          <RecapsTab episodeRecap={episodeRecap} setEpisodeRecap={setEpisodeRecap}/>
        )}
        {commishTab === "cast" && (
          <CastTribesTab/>
        )}
        {commishTab === "tools" && (
          <ToolsTab currentUser={currentUser} setView={setView}/>
        )}
      </div>
    </div>
  );
}
