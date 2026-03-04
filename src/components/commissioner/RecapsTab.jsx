import { S } from "../../styles/theme.js";
import { useLeague } from "../../contexts/LeagueContext.jsx";

function renderRecap(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const output = [];
  let bulletBuffer = [];
  const flushBullets = () => {
    if (bulletBuffer.length === 0) return;
    output.push(
      <ul key={`ul-${output.length}`} style={{ paddingLeft: 20, margin: "2px 0 6px" }}>
        {bulletBuffer.map((b, j) => (
          <li key={j} style={{ color: "#E8D5B5", fontSize: 15, lineHeight: 1.6 }}>{b}</li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  };
  lines.forEach((line, i) => {
    if (line.startsWith("- ")) {
      bulletBuffer.push(line.slice(2));
    } else {
      flushBullets();
      if (line.trim() === "") {
        output.push(<div key={i} style={{ height: 6 }} />);
      } else {
        output.push(<p key={i} style={{ color: "#E8D5B5", fontSize: 15, lineHeight: 1.6, margin: "2px 0" }}>{line}</p>);
      }
    }
  });
  flushBullets();
  return <div>{output}</div>;
}

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
          <select value={episodeRecap.episode} onChange={e => setEpisodeRecap({ ...episodeRecap, episode: parseInt(e.target.value) || 1 })} style={{ ...S.select, width: "auto" }}>
            {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>Episode {n}</option>
            ))}
          </select>
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
              {renderRecap(ep.recap)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
