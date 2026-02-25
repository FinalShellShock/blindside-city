import { useState } from "react";
import { S, globalStyles } from "../../styles/theme.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { TorchIcon } from "../shared/Icons.jsx";
import FireParticles from "../shared/FireParticles.jsx";

export default function RegisterScreen({ onSwitchToLogin }) {
  const { signUp, signInGoogle } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    if (!displayName.trim()) { setError("Enter a display name"); return; }
    if (!email.trim()) { setError("Enter your email"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords don't match"); return; }
    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim());
    } catch (e) {
      setError(friendlyError(e.code));
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInGoogle(displayName.trim() || null);
    } catch (e) {
      if (e.code !== "auth/popup-closed-by-user") setError(friendlyError(e.code));
    }
    setLoading(false);
  };

  return (
    <div style={S.loginScreen}>
      <style>{globalStyles}</style>
      <FireParticles/>
      <div style={S.loginCard}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <TorchIcon size={48}/>
          <h1 style={S.title}>BLINDSIDE ISLAND</h1>
          <p style={S.subtitle}>JOIN THE ISLAND</p>
        </div>

        <input
          style={S.input}
          placeholder="Display name (shown to your league)"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
        />
        <input
          style={S.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          style={S.input}
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <input
          style={S.input}
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleRegister()}
        />

        {error && <p style={S.error}>{error}</p>}

        <button style={{ ...S.primaryBtn, opacity: loading ? 0.6 : 1 }} onClick={handleRegister} disabled={loading}>
          {loading ? "Creating account..." : "Join the Island"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }}/>
          <span style={{ color: "#A89070", fontSize: 13 }}>or</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }}/>
        </div>

        <button onClick={handleGoogle} disabled={loading} style={{
          width: "100%", padding: "12px 24px", background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8,
          color: "#E8D5B5", fontFamily: "'Cinzel',serif", fontSize: 14,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          opacity: loading ? 0.6 : 1,
        }}>
          <GoogleIcon/> Sign up with Google
        </button>

        <p style={{ ...S.hint, marginTop: 24 }}>
          Already have an account?{" "}
          <span style={{ color: "#FF8C42", cursor: "pointer" }} onClick={onSwitchToLogin}>
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

function friendlyError(code) {
  switch (code) {
    case "auth/email-already-in-use": return "An account with that email already exists";
    case "auth/invalid-email": return "Invalid email address";
    case "auth/weak-password": return "Password is too weak";
    default: return "Something went wrong, try again";
  }
}
