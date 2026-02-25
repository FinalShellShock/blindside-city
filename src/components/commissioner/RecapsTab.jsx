import { S } from "../../styles/theme.js";
import { useLeague } from "../../contexts/LeagueContext.jsx";

export default function RecapsTab({ episodeRecap, setEpisodeRecap }) {
  const { appState, saveRecap: saveRecapCtx } = useLeague();

  const saveRecap = () => saveRecapCtx(episodeRecap);
  return (
    <div>
      <div style={S.card}>
        <h2 style={S.cardTitle}>Episode Recap</h2>
        <p style={{ color: "#A89070", fontSize: 13, marginBottom: 16 }}>Recaps appear on the Home page episode feed once saved.</p>
        <div style={S.formRow}>
          <label style={S.formLabel}>Episode #</label>
          <input type="number" min="1" max="20" value={episodeRecap.episode} onChange={e => setEpisodeRecap({ ...episodeRecap, episode: parseInt(e.target.value) || 1 })} style={{ ...S.input, width: 80 }}/>
        </div>
        <textarea
          style={{ ...S.input, minHeight: 120, resize: "vertical" }}
          placeholder="What happened this episode..."
          value={episodeRecap.text}
          onChange={e => setEpisodeRecap({ ...episodeRecap, text: e.target.value })}
        />
        <button style={S.primaryBtn} onClick={saveRecap}>Save Recap</button>
      </div>

      {[...(appState.episodes || [])].filter(ep => ep.recap).sort((a, b) => b.number - a.number).length > 0 && (
        <div style={S.card}>
          <h2 style={S.cardTitle}>Posted Recaps</h2>
          {[...(appState.episodes || [])].filter(ep => ep.recap).sort((a, b) => b.number - a.number).map(ep => (
            <div key={ep.number} style={{ marginBottom: 16, padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 8, borderLeft: "3px solid #FF8C42" }}>
              <p style={S.epLabel}>Episode {ep.number}</p>
              <p style={{ color: "#E8D5B5", fontSize: 15, lineHeight: 1.5 }}>{ep.recap}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
