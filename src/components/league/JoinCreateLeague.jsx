import { useState } from "react";
import { S, globalStyles } from "../../styles/theme.js";
import FireParticles from "../shared/FireParticles.jsx";
import { useLeague } from "../../contexts/LeagueContext.jsx";

export default function JoinCreateLeague({ firebaseUid, currentUser, displayName, onBack }) {
  const { createNewLeague, joinLeague } = useLeague();

  const [tab, setTab] = useState("join"); // "join" | "create"
  const [inviteCode, setInviteCode] = useState("");
  const [leagueName, setLeagueName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setBusy(true);
    setError("");
    try {
      const id = await joinLeague(firebaseUid, currentUser, displayName, inviteCode.trim());
      if (!id) setError("Invalid invite code. Double-check and try again.");
      else if (onBack) onBack(); // dismiss overlay on success
    } catch (e) {
      console.error("Join league error:", e);
      if (e?.code === "permission-denied") {
        setError("Permission denied — your account may not have access to this feature yet. Try logging out and back in.");
      } else {
        setError(`Something went wrong: ${e?.message || e?.code || "unknown error"}`);
      }
    }
    setBusy(false);
  };

  const handleCreate = async () => {
    if (!leagueName.trim()) return;
    setBusy(true);
    setError("");
    try {
      await createNewLeague(firebaseUid, currentUser, displayName, leagueName.trim());
      if (onBack) onBack(); // dismiss overlay on success
    } catch (e) {
      console.error("Create league error:", e);
      if (e?.code === "permission-denied") {
        setError("Permission denied — your account may not have access to this feature yet. Try logging out and back in.");
      } else {
        setError(`Something went wrong: ${e?.message || e?.code || "unknown error"}`);
      }
    }
    setBusy(false);
  };

  return (
    <div style={S.loginScreen}>
      <style>{globalStyles}</style>
      <FireParticles />
      <div style={{ ...S.loginCard, maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img src="/logo.png" alt="Blindside Island" style={{ height: 80, marginBottom: 8 }}/>
          <h1 style={S.title}>BLINDSIDE ISLAND</h1>
          <p style={S.subtitle}>Welcome, {displayName}</p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            style={{ background: "none", border: "none", color: "#A89070", fontSize: 13, cursor: "pointer", marginBottom: 16, padding: 0, fontFamily: "'Crimson Pro',serif" }}
          >
            ← Back to league
          </button>
        )}

        {/* Tab row */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: 24 }}>
          {[
            { id: "join", label: "Join a League" },
            { id: "create", label: "Create a League" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setError(""); }}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                borderBottom: tab === t.id ? "2px solid #FF8C42" : "2px solid transparent",
                color: tab === t.id ? "#FF8C42" : "#A89070",
                fontFamily: "'Cinzel',serif",
                fontSize: 13,
                letterSpacing: 1,
                padding: "10px 0",
                cursor: "pointer",
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "join" && (
          <div>
            <p style={{ color: "#A89070", fontSize: 14, marginBottom: 16 }}>
              Enter the invite code from your league commissioner.
            </p>
            <input
              style={S.input}
              placeholder="e.g. AB12CD"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && handleJoin()}
              maxLength={6}
            />
            {error && <p style={S.error}>{error}</p>}
            <button
              style={{ ...S.primaryBtn, marginTop: 8, opacity: busy ? 0.6 : 1 }}
              onClick={handleJoin}
              disabled={busy || !inviteCode.trim()}
            >
              {busy ? "Joining..." : "Join League"}
            </button>
          </div>
        )}

        {tab === "create" && (
          <div>
            <p style={{ color: "#A89070", fontSize: 14, marginBottom: 16 }}>
              Start a new league. You'll be the commissioner.
            </p>
            <input
              style={S.input}
              placeholder="League name, e.g. Survivor Nerds 2025"
              value={leagueName}
              onChange={e => setLeagueName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              maxLength={50}
            />
            {error && <p style={S.error}>{error}</p>}
            <button
              style={{ ...S.primaryBtn, marginTop: 8, opacity: busy ? 0.6 : 1 }}
              onClick={handleCreate}
              disabled={busy || !leagueName.trim()}
            >
              {busy ? "Creating..." : "Create League"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
