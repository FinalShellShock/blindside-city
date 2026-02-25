export default function FireParticles() {
  const p = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    dur: 2 + Math.random() * 2,
    size: 2 + Math.random() * 4,
  }));
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {p.map(x => (
        <div key={x.id} style={{
          position: "absolute", bottom: "-10px", left: `${x.left}%`,
          width: `${x.size}px`, height: `${x.size}px`, borderRadius: "50%",
          background: "radial-gradient(circle,#FF6B35,#FF8C42,transparent)",
          animation: `fireFloat ${x.dur}s ease-in ${x.delay}s infinite`, opacity: 0,
        }}/>
      ))}
    </div>
  );
}
