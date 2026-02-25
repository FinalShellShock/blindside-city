import { useState } from "react";
import { S, globalStyles } from "../../styles/theme.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import FireParticles from "../shared/FireParticles.jsx";

export default function LoginScreen({ onSwitchToRegister }) {
  const { signIn, signInGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError("");
    if (!email.trim() || !password.trim()) { setError("Enter your email and password"); return; }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError(friendlyError(e.code));
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInGoogle();
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
          <img src="/logo.png" alt="Blindside Island" style={{ width: "100%", maxWidth: 320, height: "auto", marginBottom: 8 }}/>
          <h1 style={S.title}>BLINDSIDE ISLAND</h1>
          <p style={S.subtitle}>SEASON 50 · IN THE HANDS OF THE FANS</p>
        </div>

        <input
          style={S.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSignIn()}
        />
        <input
          style={S.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSignIn()}
        />

        {error && <p style={S.error}>{error}</p>}

        <button style={{ ...S.primaryBtn, opacity: loading ? 0.6 : 1 }} onClick={handleSignIn} disabled={loading}>
          {loading ? "Signing in..." : "Enter Tribal"}
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
          <GoogleIcon/> Sign in with Google
        </button>

        <p style={{ ...S.hint, marginTop: 24 }}>
          New player?{" "}
          <span style={{ color: "#FF8C42", cursor: "pointer" }} onClick={onSwitchToRegister}>
            Join the Island
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
    case "auth/invalid-email": return "Invalid email address";
    case "auth/user-not-found": return "No account found with that email";
    case "auth/wrong-password": return "Incorrect password";
    case "auth/invalid-credential": return "Invalid email or password";
    case "auth/too-many-requests": return "Too many attempts — try again later";
    default: return "Something went wrong, try again";
  }
}
