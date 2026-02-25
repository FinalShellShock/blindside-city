import { S } from "../../styles/theme.js";

const sections = [
  {
    icon: "🏝️",
    title: "Navigating the App",
    items: [
      { q: "Home", a: "Your main feed — see the league announcement, standings, recent episode events, and eliminations." },
      { q: "My Team", a: "View your drafted contestants, their scores, and your total points." },
      { q: "Scoreboard", a: "Full league leaderboard. Tap any team to expand and see individual contestant scores." },
      { q: "Cast", a: "See all contestants, their tribes, and elimination status." },
      { q: "Rules", a: "The current scoring rules for your league." },
      { q: "Draft", a: "Appears when a draft is pending or active. Join the lobby and make your picks when it's your turn." },
    ],
  },
  {
    icon: "🏆",
    title: "Leagues",
    items: [
      { q: "Switching leagues", a: "Tap the league name in the top-left header to open the league switcher. Select any league you belong to." },
      { q: "Joining a league", a: "From the league switcher, choose \"Join or Create\" and enter the invite code your commissioner shared with you." },
      { q: "Creating a league", a: "From the league switcher, choose \"Join or Create\" then \"Create New League\". You'll become the commissioner." },
    ],
  },
  {
    icon: "👁️",
    title: "Spoiler Filter",
    items: [
      { q: "What is it?", a: "The Spoiler Filter in the header controls how much of the season you've watched. Set it to the last episode you saw and scores, eliminations, and events will be hidden beyond that point." },
      { q: "Last Episode Watched", a: "Default setting — hides all episode results. Set this when you haven't watched anything yet." },
      { q: "All caught up", a: "Shows everything with no filtering. Use this once you're fully caught up." },
    ],
  },
  {
    icon: "👤",
    title: "Your Account",
    items: [
      { q: "Changing your name or avatar", a: "Click your display name or avatar photo in the top-right header to open the Account panel. Pick a stock avatar or paste a custom image URL, then save." },
    ],
  },
];

export default function HelpPanel({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "flex-start", justifyContent: "flex-end",
        padding: "70px 24px 0",
        overflowY: "auto",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "rgba(42,26,10,0.97)",
          border: "1px solid rgba(255,140,66,0.2)",
          borderRadius: 14,
          padding: 28,
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
          marginBottom: 24,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 18, color: "#FFD93D", fontWeight: 700 }}>
            Help & Guide
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#A89070", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>

        {sections.map(section => (
          <div key={section.title} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>{section.icon}</span>
              <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 14, fontWeight: 700, color: "#FF8C42", letterSpacing: 1 }}>
                {section.title.toUpperCase()}
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {section.items.map(item => (
                <div key={item.q} style={{ padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, borderLeft: "2px solid rgba(255,140,66,0.25)" }}>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 12, color: "#FF8C42", marginBottom: 4, fontWeight: 600 }}>{item.q}</p>
                  <p style={{ color: "#C8B89A", fontSize: 14, lineHeight: 1.5 }}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
