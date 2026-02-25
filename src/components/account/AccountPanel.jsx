import { useState } from "react";
import { S } from "../../styles/theme.js";
import { useAuth } from "../../contexts/AuthContext.jsx";

const STOCK_AVATARS = Array.from({ length: 8 }, (_, i) => `/avatars/avatar${i + 1}.png`);

export default function AccountPanel({ onClose }) {
  const { userProfile, updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || "");
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile?.avatar || "");
  const [customUrl, setCustomUrl] = useState(
    userProfile?.avatar && !STOCK_AVATARS.includes(userProfile.avatar)
      ? userProfile.avatar
      : ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const effectiveAvatar = customUrl.trim() || selectedAvatar;

  async function handleSave() {
    if (!displayName.trim()) return;
    setSaving(true);
    await updateProfile({
      displayName: displayName.trim(),
      avatar: effectiveAvatar,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "flex-start", justifyContent: "flex-end",
        padding: "70px 24px 0",
      }}
    >
      {/* Panel — stop clicks from closing */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "rgba(42,26,10,0.97)",
          border: "1px solid rgba(255,140,66,0.2)",
          borderRadius: 14,
          padding: 28,
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 18, color: "#FFD93D", fontWeight: 700 }}>
            My Account
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#A89070", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>

        {/* Avatar preview */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <img
            src={effectiveAvatar || STOCK_AVATARS[0]}
            alt="Your avatar"
            style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,140,66,0.4)" }}
          />
        </div>

        {/* Display name */}
        <label style={S.formLabel}>Display Name</label>
        <input
          style={{ ...S.input, marginBottom: 20 }}
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          maxLength={30}
          placeholder="Your name"
        />

        {/* Stock avatar grid */}
        <label style={S.formLabel}>Choose Avatar</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
          {STOCK_AVATARS.map(src => (
            <img
              key={src}
              src={src}
              alt="avatar option"
              onClick={() => { setSelectedAvatar(src); setCustomUrl(""); }}
              style={{
                width: "100%",
                aspectRatio: "1",
                borderRadius: "50%",
                objectFit: "cover",
                cursor: "pointer",
                border: selectedAvatar === src && !customUrl.trim()
                  ? "2px solid #FF8C42"
                  : "2px solid rgba(255,255,255,0.1)",
                transition: "border 0.15s",
              }}
            />
          ))}
        </div>

        {/* Custom URL */}
        <label style={S.formLabel}>Or paste image URL</label>
        <input
          style={{ ...S.input, marginBottom: 24 }}
          value={customUrl}
          onChange={e => { setCustomUrl(e.target.value); setSelectedAvatar(""); }}
          placeholder="https://..."
        />

        {/* Save */}
        <button
          style={{ ...S.primaryBtn, opacity: saving ? 0.6 : 1 }}
          onClick={handleSave}
          disabled={saving || !displayName.trim()}
        >
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
