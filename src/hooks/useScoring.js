import { SCORING_RULES, CONTESTANTS } from "../gameData.js";

// Accepts optional scoringRules override (for per-league rules in Phase 5)
// and optional upToEpisode filter (for spoiler protection in Phase 4).
// Defaults keep behavior identical to the original monolith.
export function useScoring(episodes = [], teams = {}, scoringRules = SCORING_RULES, upToEpisode = 999) {
  const filteredEpisodes = episodes.filter(ep => ep.number <= upToEpisode);

  const getContestantScores = () => {
    const s = {};
    CONTESTANTS.forEach(c => { s[c.name] = { total: 0, events: [], byEpisode: {} }; });
    filteredEpisodes.forEach(ep => {
      (ep.events || []).forEach(ev => {
        const r = scoringRules[ev.type];
        if (r && s[ev.contestant]) {
          s[ev.contestant].total += r.points;
          s[ev.contestant].events.push({
            episode: ep.number,
            type: ev.type,
            label: r.label,
            points: r.points,
          });
          s[ev.contestant].byEpisode[ep.number] =
            (s[ev.contestant].byEpisode[ep.number] || 0) + r.points;
        }
      });
    });
    return s;
  };

  const getTeamScores = (contestantScores) => {
    const ts = {};
    Object.entries(teams).forEach(([tn, team]) => {
      let total = 0;
      const ms = {};
      (team.members || []).forEach(m => {
        const sc = contestantScores[m]?.total || 0;
        ms[m] = sc;
        total += sc;
      });
      const epNums = [...new Set(filteredEpisodes.map(e => e.number))].sort((a, b) => a - b);
      let cum = 0;
      const prog = epNums.map(ep => {
        let et = 0;
        (team.members || []).forEach(m => { et += contestantScores[m]?.byEpisode[ep] || 0; });
        cum += et;
        return cum;
      });
      ts[tn] = { total, memberScores: ms, owner: team.owner, progression: prog };
    });
    return ts;
  };

  const contestantScores = getContestantScores();
  const teamScores = getTeamScores(contestantScores);
  const sortedTeams = Object.entries(teamScores).sort((a, b) => b[1].total - a[1].total);

  return { contestantScores, teamScores, sortedTeams };
}
