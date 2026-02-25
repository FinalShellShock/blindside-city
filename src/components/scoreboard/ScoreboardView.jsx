import { useState } from "react";
import { S } from "../../styles/theme.js";
import { useLeague } from "../../contexts/LeagueContext.jsx";
import MiniChart from "../shared/MiniChart.jsx";
import { SkullIcon } from "../shared/Icons.jsx";

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

export default function ScoreboardView() {
  const { appState, sortedTeams, teamScores, eliminated, getEffectiveTribe, tribeColors } = useLeague();
  const [expandedTeam, setExpandedTeam] = useState(null);

  return (
    <div>
      <div style={S.card}>
        <h2 style={S.cardTitle}>Scoreboard</h2>
        {sortedTeams.map(([name, data], i) => (
          <div key={name} style={S.leaderboardCard} onClick={() => setExpandedTeam(expandedTeam === name ? null : name)}>
            <div style={S.leaderboardHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  ...S.rankBadge,
                  background: i === 0 ? "linear-gradient(135deg,#FFD93D,#FF8C42)"
                    : i === 1 ? "linear-gradient(135deg,#C0C0C0,#A0A0A0)"
                    : i === 2 ? "linear-gradient(135deg,#CD7F32,#A0622E)"
                    : "#3D3020",
                }}>{i + 1}</span>
                {appState.teams[name]?.logo && (
                  <img src={appState.teams[name].logo} alt="logo" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,140,66,0.3)" }}/>
                )}
                <div>
                  <p style={S.lbTeamName}>{name}</p>
                  <p style={S.lbOwner}>{appState.users[data.owner]?.displayName}</p>
                  {appState.teams[name]?.motto && <p style={{ color: "#A89070", fontSize: 12, fontStyle: "italic", marginTop: 2 }}>{appState.teams[name].motto}</p>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={S.lbTotal}>{data.total}</p>
                {data.progression?.length > 1 && <MiniChart data={data.progression} width={120} height={30}/>}
              </div>
            </div>
            {expandedTeam === name && (
              <div style={S.lbMembers}>
                {Object.entries(data.memberScores).sort((a, b) => b[1] - a[1]).map(([member, score]) => {
                  const isE = isElim(eliminated, member);
                  const curTribe = getEffectiveTribe(member);
                  return (
                    <div key={member} style={S.lbMemberRow}>
                      <div style={{ ...S.tribeDot, background: tribeColor(tribeColors, curTribe) }}/>
                      <span style={{ flex: 1, color: "#E8D5B5", textDecoration: isE ? "line-through" : "none", opacity: isE ? 0.5 : 1 }}>
                        {member} {isE && <SkullIcon size={12}/>}
                      </span>
                      <span style={{ color: "#FF8C42", fontWeight: 600 }}>{score}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        {sortedTeams.length === 0 && <p style={{ color: "#A89070" }}>No teams yet.</p>}
      </div>
    </div>
  );
}
