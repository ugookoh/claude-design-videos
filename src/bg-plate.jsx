const useComposition = (...a) => window.useComposition(...a);
const interpolate = (...a) => window.interpolate(...a);

const GRID_LINE = 'oklch(0.42 0.014 62 / 0.62)';
const GRID_STEP = 120;

const rnd = (i, k) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// slow-drifting motes — depth without noise
const MOTES = Array.from({ length: 34 }, (_, i) => ({
  x: rnd(i, 1) * 1920,
  y: rnd(i, 2) * 1080,
  r: 2 + rnd(i, 3) * 5,
  spd: 5 + rnd(i, 4) * 13,
  sway: 18 + rnd(i, 5) * 46,
  phase: rnd(i, 6) * Math.PI * 2,
  a: 0.10 + rnd(i, 7) * 0.20,
}));

function BgPlate() {
  const { T } = useComposition();
  const drift = -((T * 9) % GRID_STEP);
  const breathe = Math.sin(T * 0.22);
  const breathe2 = Math.sin(T * 0.17 + 1.9);
  const sweep = ((T * 0.055) % 1);

  return (
    <div style={{
      position: 'absolute', left: 0, top: 0, width: 1920, height: 1080,
      transform: 'scale(2)', transformOrigin: '0 0', overflow: 'hidden',
      background: 'radial-gradient(120% 90% at 50% 8%, oklch(0.19 0.010 62) 0%, oklch(0.126 0.007 60) 58%, oklch(0.10 0.005 60) 100%)',
    }}>
      <div style={{
        position: 'absolute', left: '50%', bottom: '-14%', width: 4200, height: 2600,
        marginLeft: -2100,
        transform: `perspective(1100px) rotateX(66deg) translateY(${drift}px)`,
        transformOrigin: '50% 100%',
        backgroundImage: `linear-gradient(${GRID_LINE} 1px, transparent 1px), linear-gradient(90deg, ${GRID_LINE} 1px, transparent 1px)`,
        backgroundSize: `${GRID_STEP}px ${GRID_STEP}px`,
        maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 32%, rgba(0,0,0,0.9) 70%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 32%, rgba(0,0,0,0.9) 70%, transparent 100%)',
        opacity: 0.9,
      }}></div>

      <div style={{
        position: 'absolute', left: '50%', top: '-22%', width: 3000, height: 1700, marginLeft: -1500,
        transform: `perspective(1100px) rotateX(-64deg) translateY(${-drift}px)`,
        transformOrigin: '50% 0%',
        backgroundImage: `linear-gradient(${GRID_LINE} 1px, transparent 1px), linear-gradient(90deg, ${GRID_LINE} 1px, transparent 1px)`,
        backgroundSize: `${GRID_STEP}px ${GRID_STEP}px`,
        maskImage: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.75) 80%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.75) 80%, transparent 100%)',
        opacity: 0.38,
      }}></div>

      <div style={{
        position: 'absolute', left: '10%', top: '2%', width: 1600, height: 1200,
        background: 'radial-gradient(closest-side, oklch(0.78 0.15 75 / 0.115), transparent 72%)',
        transform: `translate(${breathe * 60}px, ${breathe * 34}px) scale(${1 + breathe * 0.07})`,
      }}></div>
      <div style={{
        position: 'absolute', right: '4%', bottom: '-4%', width: 1500, height: 1100,
        background: 'radial-gradient(closest-side, oklch(0.62 0.06 250 / 0.115), transparent 72%)',
        transform: `translate(${breathe2 * -50}px, ${breathe2 * 30}px) scale(${1 - breathe2 * 0.07})`,
      }}></div>
      <div style={{
        position: 'absolute', left: '38%', top: '34%', width: 1100, height: 900,
        background: 'radial-gradient(closest-side, oklch(0.70 0.09 60 / 0.055), transparent 70%)',
        transform: `scale(${1 + Math.sin(T * 0.13 + 3.1) * 0.10})`,
      }}></div>

      <div style={{
        position: 'absolute', top: 0, bottom: 0, width: 900,
        left: `${-30 + sweep * 150}%`,
        background: 'linear-gradient(100deg, transparent, oklch(0.86 0.03 80 / 0.035), transparent)',
        transform: 'skewX(-14deg)',
      }}></div>

      {MOTES.map((m, i) => {
        const y = ((m.y - T * m.spd) % 1200 + 1200) % 1200 - 60;
        const x = m.x + Math.sin(T * 0.20 + m.phase) * m.sway;
        return (
          <div key={i} style={{
            position: 'absolute', left: x, top: y, width: m.r, height: m.r, borderRadius: '50%',
            background: `oklch(0.88 0.03 80 / ${m.a})`,
          }}></div>
        );
      })}

      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(115% 80% at 50% 45%, transparent 40%, rgba(0,0,0,0.55) 100%)',
      }}></div>
    </div>
  );
}

window.BgPlate = BgPlate;
