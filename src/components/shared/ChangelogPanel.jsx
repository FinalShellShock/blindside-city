import { useEffect } from "react";

const CHANGELOG = [
  {
    version: "v1.3",
    date: "Mar 4, 2026",
    title: "Scoring Overhaul",
    sections: [
      {
        heading: "Scoring",
        items: [
          {
            label: "Tribe scoring mode",
            body: "Commissioners can now log events by tribe instead of selecting players one by one. Pick Individual or Tribe, select one or more tribes, and everyone on those tribes gets credited in a single click.",
          },
          {
            label: "Multi-tribe events",
            body: "When two tribes win the same event (e.g. both Vatu and Kalo winning immunity), you can select both at once and log it as a single event.",
          },
          {
            label: "Tribe pills",
            body: "Tribe names in the event log and home feed now appear as colored pill badges — styled in each tribe's color so you can tell at a glance which tribe earned the points.",
          },
          {
            label: "Cleaner event rows",
            body: "Each scoring event now shows the tribe pill(s) on top with the event label and points on the same line below. No more blank space between the tribe name and the score.",
          },
          {
            label: "New scoring event feed",
            body: "The event log now shows one row per event instead of collapsing them. Easier to read and easier to remove individual entries if something was logged wrong.",
          },
          {
            label: "Episode 1 data rebuilt",
            body: "Episode 1 scoring data was migrated to the new tribe-grouped structure — 84 individual entries condensed into 13 clean tribe events with the same scores.",
          },
        ],
      },
      {
        heading: "Eliminations",
        items: [
          {
            label: "Elimination types",
            body: "When marking someone out, you can now specify how they left — voted out, medically evacuated, or quit. Shows up on their player card.",
          },
          {
            label: "Multiple eliminations per episode",
            body: "The commissioner can now log more than one elimination in the same episode, which covers double tribals and back-to-back votes.",
          },
          {
            label: "Mobile fix",
            body: "The elimination tracker was clipping on narrow screens. Fixed.",
          },
        ],
      },
      {
        heading: "Commissioner tools",
        items: [
          {
            label: "Episode dropdowns",
            body: "Episode number inputs across the commissioner panel have been replaced with dropdowns — less fiddly, fewer mistakes.",
          },
          {
            label: "Announcement timestamps",
            body: "Commissioner announcements now show when they were posted.",
          },
        ],
      },
      {
        heading: "Reactions",
        items: [
          {
            label: "Per-event reactions",
            body: "You can now react to individual scoring events, eliminations, and episode recaps with emojis. Look for the reaction bar below each entry on the home feed.",
          },
        ],
      },
    ],
  },
  {
    version: "v1.2",
    date: "Feb 25, 2026 · 1:42 PM ET",
    title: "Blindside Island — What's New",
    sections: [
      {
        heading: null,
        items: [
          {
            label: "Help & Guide",
            body: "Tap the ? button in the header to open the new Help panel. It covers how to navigate the app and how the spoiler filter works.",
          },
          {
            label: "Account panel",
            body: "Click your name or avatar in the top-right to open your account settings. You can update your display name, pick from 8 Survivor-themed avatars, or paste in a custom image URL.",
          },
          {
            label: "Commissioner tooltips",
            body: "Every section in the Commissioner tab now has a ? tooltip explaining what it does.",
          },
          {
            label: "Logout moved",
            body: "The logout button now lives inside your Account panel (top-right → your name/avatar) instead of cluttering the header.",
          },
          {
            label: "Mobile polish",
            body: "A bunch of small fixes to make the header and panels feel better on phones — tighter spacing, proper right-alignment, and panels now lock the page scroll behind them.",
          },
        ],
      },
    ],
  },
  {
    version: "v1.1",
    date: "Feb 24, 2026 · 1:42 PM ET",
    title: "Blindside Island — What's New",
    sections: [
      {
        heading: null,
        items: [
          {
            label: "We've moved!",
            body: "We purchased our own domain and the app is now live at blindsideisland.com 🌴🎉. Same league, same teams, same data — just a real home of our own.",
          },
          {
            label: "New account system",
            body: "The old username/password login has been replaced with a proper account system. See the migration guide below for how to get set up — it takes about 30 seconds.",
          },
          {
            label: "Multiple leagues!!",
            body: "You can now be part of more than one league. Use the league selector in the top left to switch between leagues or create/join a new one.",
          },
          {
            label: "Draft system",
            body: "Commissioners can now run a live snake draft to assign contestants to teams instead of setting them manually.",
          },
          {
            label: "Spoiler protection 🙈",
            body: "On the Home screen you can set which episode you've watched through — scores and eliminations beyond that episode will be hidden until you're caught up.",
          },
          {
            label: "Scoring rule customization",
            body: "Commissioners can now adjust point values for any scoring event and add fully custom rules.",
          },
        ],
      },
    ],
  },
  {
    version: "v1.0",
    date: "Feb 25, 2025 · 2:49 PM ET",
    title: "Blindside City Update 🔥",
    sections: [
      {
        heading: null,
        items: [
          {
            label: "Stay logged in",
            body: "You no longer get kicked to the login screen every time you refresh. The app remembers you.",
          },
          {
            label: "Team logos",
            body: "Go to My Team and tap your team's logo area (or the + Logo button if you don't have one yet). You can pick from 10 custom Survivor-themed images or paste in your own image URL. Tap the pencil icon anytime to change it.",
          },
          {
            label: "Home page standings",
            body: "The home page is now a clean standings view showing everyone's rank, logo, and score at a glance. Commissioner announcements and episode recaps will appear here too.",
          },
          {
            label: "My Team — score breakdown",
            body: "Tap any of your players to see a full breakdown of every point they've earned, organized by episode.",
          },
          {
            label: "Scoreboard (formerly Leaderboard)",
            body: "Tap any team to expand and see their full roster with individual scores.",
          },
          {
            label: "Cast page",
            body: "Tap any contestant to see their scoring history by episode.",
          },
          {
            label: "Tribe swaps & merge",
            body: "Now tracked in the app. When tribes get swapped or we hit the merge, the commissioner will update it and it'll reflect everywhere — player cards, cast page, scoring screen, all of it.",
          },
          {
            label: "Commissioner tab redesign",
            body: "The commissioner tab has its own internal sidebar now with four sections: Update Scoring, Episode Recaps, Cast & Tribes, and Tools. Scoring uses tribe-colored chips so you can select multiple players at once for the same event.",
          },
        ],
      },
    ],
  },
];

export default function ChangelogPanel({ onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        padding: "0",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "rgba(30,18,6,0.99)",
          border: "1px solid rgba(255,140,66,0.2)",
          borderRadius: "14px 14px 0 0",
          padding: "0 0 32px",
          width: "100%",
          maxWidth: 520,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* Sticky header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 24px 16px",
          borderBottom: "1px solid rgba(255,140,66,0.1)",
          flexShrink: 0,
        }}>
          <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 17, color: "#FFD93D", fontWeight: 700 }}>
            Changelog
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#A89070", fontSize: 20, cursor: "pointer", lineHeight: 1 }}
          >✕</button>
        </div>

        {/* Scrollable entries */}
        <div style={{ overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 32 }}>
          {CHANGELOG.map((entry) => (
            <div key={entry.version}>
              {/* Version + date */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 13, fontWeight: 700, color: "#FF8C42", letterSpacing: 1 }}>
                  {entry.version}
                </span>
                <span style={{ fontSize: 12, color: "#6A5040" }}>{entry.date}</span>
              </div>

              {/* Title */}
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, color: "#E8D5B5", marginBottom: 14 }}>
                {entry.title}
              </p>

              {/* Items */}
              {entry.sections.map((section, si) => (
                <div key={si} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {section.heading && (
                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: "#FF8C42", letterSpacing: 1, fontWeight: 700, textTransform: "uppercase" }}>
                      {section.heading}
                    </p>
                  )}
                  {section.items.map((item, ii) => (
                    <div key={ii} style={{ paddingLeft: 12, borderLeft: "2px solid rgba(255,140,66,0.25)" }}>
                      {item.label && (
                        <span style={{ color: "#E8D5B5", fontWeight: 600, fontSize: 14 }}>{item.label} — </span>
                      )}
                      <span style={{ color: "#C8B89A", fontSize: 14, lineHeight: 1.6 }}>{item.body}</span>
                    </div>
                  ))}
                </div>
              ))}

              {/* Divider between entries */}
              <div style={{ height: 1, background: "rgba(255,140,66,0.08)", marginTop: 28 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
