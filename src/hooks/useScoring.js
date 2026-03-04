import { SCORING_RULES, CONTESTANTS } from "../gameData.js";

// Accepts optional scoringRules override (Phase 5), upToEpisode filter (Phase 4),
// and contestants list (Phase 7 — falls back to hardcoded defaults).
export function useScoring(episodes = [], teams = {}, scoringRules = SCORING_RULES, upToEpisode = 999, contestants = CONTESTANTS) {
  const filteredEpisodes = episodes.filter(ep => ep.number <= upToEpisode);

  const getContestantScores = () => {
    const s = {};
    contestants.forEach(c => { s[c.name] = { total: 0, events: [], byEpisode: {} }; });
    filteredEpisodes.forEach(ep => {
      (ep.events || []).forEach(ev => {
        const r = scoringRules[ev.type];
        if (!r) return;
        // Normalize: tribe events have ev.contestants[], individual events have ev.contestant
        const targets = ev.contestants ? ev.contestants : (ev.contestant ? [ev.contestant] : []);
        targets.forEach(name => {
          if (!s[name]) return;
          s[name].total += r.points;
          s[name].events.push({ episode: ep.number, type: ev.type, label: r.label, points: r.points });
          s[name].byEpisode[ep.number] = (s[name].byEpisode[ep.number] || 0) + r.points;
        });
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
