// House background for every full-screen b-roll clip in this project.
// Opaque (never keyed) — so real depth, shadows and soft light are allowed here.
const useComposition = (...a) => window.useComposition(...a);
const interpolate = (...a) => window.interpolate(...a);

const GRID_LINE = 'oklch(0.42 0.014 62 / 0.62)';
const GRID_STEP = 120;

function StageBg(props) {
  const { T } = useComposition();
  const drift = -((T * 26) % GRID_STEP);
  const breathe = Math.sin(T * 0.32);

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
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
        position: 'absolute', left: '14%', top: '6%', width: 1500, height: 1100,
        background: 'radial-gradient(closest-side, oklch(0.78 0.15 75 / 0.10), transparent 72%)',
        transform: `scale(${1 + breathe * 0.05})`,
      }}></div>
      <div style={{
        position: 'absolute', right: '8%', bottom: '2%', width: 1400, height: 1000,
        background: 'radial-gradient(closest-side, oklch(0.62 0.06 250 / 0.10), transparent 72%)',
        transform: `scale(${1 - breathe * 0.05})`,
      }}></div>

      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(115% 80% at 50% 45%, transparent 40%, rgba(0,0,0,0.55) 100%)',
      }}></div>
    </div>
  );
}

window.StageBg = StageBg;
