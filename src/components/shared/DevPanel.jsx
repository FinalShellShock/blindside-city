import { useState } from "react";
import { DEFAULT_STATE } from "../../gameData.js";
import { devBtn } from "../../styles/theme.js";

export function useDevMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get("dev") === "torchsnuffer";
}

export default function DevPanel({ appState, saveState, setCurrentUser, currentUser }) {
  const [showRaw, setShowRaw] = useState(false);
  return (
    <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
      <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 16, color: "#4ADE80", marginBottom: 12, letterSpacing: 1 }}>🛠 DEV MODE</h2>
      <div style={{ marginBottom: 12 }}>
        <p style={{ color: "#4ADE80", fontSize: 13, marginBottom: 6, fontWeight: 600 }}>Impersonate User</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {Object.entries(appState.users || {}).map(([key, u]) => (
            <button key={key} onClick={() => setCurrentUser(key)} style={{
              padding: "4px 10px", borderRadius: 6,
              border: currentUser === key ? "1px solid #4ADE80" : "1px solid rgba(255,255,255,0.1)",
              background: currentUser === key ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.03)",
              color: currentUser === key ? "#4ADE80" : "#A89070",
              fontSize: 12, cursor: "pointer", fontFamily: "'Crimson Pro',serif",
            }}>
              {u.displayName}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={() => {
          if (confirm("Seed test data?")) {
            saveState({ ...appState, users: { ...appState.users, testuser1: { displayName: "TestPlayer1", password: "test" }, testuser2: { displayName: "TestPlayer2", password: "test" } } });
          }
        }} style={devBtn}>Seed Test Users</button>
        <button onClick={() => setShowRaw(!showRaw)} style={devBtn}>{showRaw ? "Hide" : "Show"} Raw State</button>
        <button onClick={() => { if (confirm("NUKE EVERYTHING?")) saveState(DEFAULT_STATE); }} style={{ ...devBtn, color: "#F87171", borderColor: "rgba(248,113,113,0.4)" }}>Full Reset</button>
      </div>
      {showRaw && (
        <pre style={{ background: "rgba(0,0,0,0.3)", padding: 12, borderRadius: 8, fontSize: 11, color: "#A89070", overflow: "auto", maxHeight: 300, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {JSON.stringify(appState, null, 2)}
        </pre>
      )}
      <p style={{ color: "rgba(74,222,128,0.5)", fontSize: 11, marginTop: 8 }}>
        Registered: {Object.keys(appState.users || {}).length} users · {Object.keys(appState.teams || {}).length} teams · {(appState.episodes || []).reduce((a, e) => a + (e.events || []).length, 0)} events
      </p>
    </div>
  );
}
