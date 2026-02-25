import { useState, useEffect, useRef } from "react";

const REACTION_EMOJIS = ["🔥", "👑", "💀", "😤", "😂", "❤️"];

export default function ReactionBar({ reactions = {}, onReact, currentUser, users = {} }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeEmoji, setActiveEmoji] = useState(null);
  const [arrowOffset, setArrowOffset] = useState(12);
  const holdTimer = useRef(null);
  const dismissTimer = useRef(null);
  const didHold = useRef(false);
  const wrapperRef = useRef(null);
  const activeEmojis = REACTION_EMOJIS.filter(e => (reactions[e] || []).length > 0);

  const getNames = (userKeys) =>
    userKeys.map(k => users[k]?.displayName || k).join(", ");

  const scheduleDismiss = () => {
    clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => setActiveEmoji(null), 3000);
  };

  useEffect(() => {
    if (!activeEmoji) return;
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setActiveEmoji(null);
      }
    };
    document.addEventListener("touchstart", handler);
    return () => document.removeEventListener("touchstart", handler);
  }, [activeEmoji]);

  const [tooltipLeft, setTooltipLeft] = useState(0);

  const showTooltip = (emoji, btnEl) => {
    setActiveEmoji(emoji);
    if (btnEl && wrapperRef.current) {
      const btnRect = btnEl.getBoundingClientRect();
      const wrapRect = wrapperRef.current.getBoundingClientRect();
      const pillCenter = btnRect.left + btnRect.width / 2 - wrapRect.left;
      const names = getNames(reactions[emoji] || []);
      const tooltipW = Math.max(80, (emoji.length + 1 + names.length) * 8 + 20);
      const ideal = pillCenter - tooltipW / 2;
      const clamped = Math.max(0, Math.min(ideal, wrapRect.width - tooltipW));
      setTooltipLeft(clamped);
      setArrowOffset(Math.max(8, Math.min(pillCenter - clamped - 5, tooltipW - 16)));
    }
  };

  const startHold = (emoji, btnEl) => {
    didHold.current = false;
    holdTimer.current = setTimeout(() => {
      didHold.current = true;
      showTooltip(emoji, btnEl);
      scheduleDismiss();
    }, 400);
  };

  const endHold = (emoji, e) => {
    e.preventDefault();
    clearTimeout(holdTimer.current);
    if (!didHold.current) {
      onReact(emoji);
      setPickerOpen(false);
      setActiveEmoji(null);
    }
  };

  return (
    <div ref={wrapperRef} style={{ marginTop: 6, position: "relative" }}>
      {activeEmoji && (reactions[activeEmoji] || []).length > 0 && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 5px)", left: tooltipLeft,
          background: "rgba(26,15,5,0.97)", border: "1px solid rgba(255,140,66,0.25)",
          borderRadius: 8, padding: "4px 10px", whiteSpace: "nowrap",
          fontSize: 12, color: "#E8D5B5", pointerEvents: "none",
          boxShadow: "0 4px 16px rgba(0,0,0,0.5)", zIndex: 200,
          fontFamily: "'Crimson Pro',serif",
        }}>
          {activeEmoji} {getNames(reactions[activeEmoji])}
          <div style={{
            position: "absolute", top: "100%", left: arrowOffset,
            width: 0, height: 0,
            borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
            borderTop: "5px solid rgba(255,140,66,0.25)",
          }}/>
        </div>
      )}

      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
        {activeEmojis.map(emoji => {
          const userKeys = reactions[emoji] || [];
          const reacted = userKeys.includes(currentUser);
          const count = userKeys.length;
          return (
            <button
              key={emoji}
              onClick={() => { onReact(emoji); setPickerOpen(false); setActiveEmoji(null); }}
              onMouseEnter={e => showTooltip(emoji, e.currentTarget)}
              onMouseLeave={() => setActiveEmoji(null)}
              onTouchStart={e => startHold(emoji, e.currentTarget)}
              onTouchEnd={e => endHold(emoji, e)}
              onTouchCancel={() => clearTimeout(holdTimer.current)}
              style={{
                padding: "2px 8px", borderRadius: 12, fontSize: 13, cursor: "pointer",
                background: reacted ? "rgba(255,140,66,0.2)" : "rgba(255,255,255,0.04)",
                border: reacted ? "1px solid rgba(255,140,66,0.5)" : "1px solid rgba(255,255,255,0.08)",
                color: reacted ? "#FF8C42" : "#A89070",
                display: "flex", alignItems: "center", gap: 4, transition: "all 0.12s",
                WebkitUserSelect: "none", userSelect: "none",
              }}>
              {emoji}<span style={{ fontSize: 12, fontWeight: 600 }}>{count}</span>
            </button>
          );
        })}
        <div style={{ position: "relative" }}>
          <button onClick={() => { setPickerOpen(o => !o); setActiveEmoji(null); }} style={{
            padding: "2px 8px", borderRadius: 12, fontSize: 13, cursor: "pointer",
            background: pickerOpen ? "rgba(255,140,66,0.12)" : "transparent",
            border: pickerOpen ? "1px solid rgba(255,140,66,0.3)" : "1px dashed rgba(255,255,255,0.15)",
            color: "#A89070", display: "flex", alignItems: "center", gap: 2, transition: "all 0.12s",
            lineHeight: 1, WebkitUserSelect: "none", userSelect: "none",
          }}>
            <span style={{ fontSize: 15, fontWeight: 300 }}>+</span>
          </button>
          {pickerOpen && (
            <div style={{
              position: "absolute", bottom: "calc(100% + 6px)", left: 0,
              display: "flex", gap: 4, padding: "6px 8px", borderRadius: 12,
              background: "rgba(42,26,10,0.97)", border: "1px solid rgba(255,140,66,0.2)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)", zIndex: 200, whiteSpace: "nowrap",
            }}>
              {REACTION_EMOJIS.map(emoji => (
                <button key={emoji} onClick={() => { onReact(emoji); setPickerOpen(false); }} style={{
                  background: "transparent", border: "none", fontSize: 20, cursor: "pointer",
                  padding: "2px 4px", borderRadius: 6, transition: "transform 0.1s", lineHeight: 1,
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.3)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
