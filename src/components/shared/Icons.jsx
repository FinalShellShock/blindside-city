export function TorchIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 32" fill="none">
      <rect x="10" y="12" width="4" height="18" rx="1" fill="#8B6914"/>
      <rect x="9" y="10" width="6" height="4" rx="1" fill="#A0782C"/>
      <ellipse cx="12" cy="7" rx="5" ry="6" fill="url(#fl1)" opacity="0.9"/>
      <ellipse cx="12" cy="6" rx="3" ry="4" fill="url(#fl2)"/>
      <ellipse cx="12" cy="5" rx="1.5" ry="2.5" fill="#FFED8A"/>
      <defs>
        <radialGradient id="fl1" cx="0.5" cy="0.7" r="0.6">
          <stop offset="0%" stopColor="#FFD93D"/>
          <stop offset="60%" stopColor="#FF6B35"/>
          <stop offset="100%" stopColor="#C4261A" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="fl2" cx="0.5" cy="0.6" r="0.5">
          <stop offset="0%" stopColor="#FFF7AE"/>
          <stop offset="100%" stopColor="#FF8C42"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

export function SkullIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: "inline", verticalAlign: "middle" }}>
      <circle cx="8" cy="7" r="6" fill="#3D3020" stroke="#F87171" strokeWidth="1"/>
      <circle cx="6" cy="6" r="1.2" fill="#F87171"/>
      <circle cx="10" cy="6" r="1.2" fill="#F87171"/>
      <rect x="7" y="9" width="2" height="2" rx="0.5" fill="#F87171"/>
    </svg>
  );
}
