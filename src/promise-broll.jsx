const useComposition = (...a) => window.useComposition(...a);
const animate = (...a) => window.animate(...a);
const interpolate = (...a) => window.interpolate(...a);
const clamp = (...a) => window.clamp(...a);
const Easing = new Proxy({}, { get: (_, k) => (window.Easing || {})[k] });

const SANS = "'Satoshi', system-ui, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";
const AMBER = 'oklch(0.79 0.155 76)';
const INK = '#f4f2ef';
const MUTED = 'oklch(0.74 0.010 68)';
const DIM = 'oklch(0.56 0.010 66)';
const PANEL = 'oklch(0.165 0.008 61)';
const HAIR = 'oklch(0.32 0.010 62)';

const LOGOS = [
  ['assets/logo-google.png', 'Google', 0.80],
  ['assets/logo-apple.png', 'Apple', 0.66],
  ['assets/logo-facebook.png', 'Meta', 0.78],
  ['assets/logo-aws.png', 'Amazon', 0.82],
  ['assets/logo-netflix.png', 'Netflix', 0.60],
];

const CHECKS = ['Know the real format', 'Drill the right patterns', 'Rehearse it out loud'];

// three lines of "redacted" copy that sharpen into the promise
const TRUTH_LINES = [
  ['What actually happens', 340],
  ['in the room, round', 300],
  ['by round.', 170],
];

function Panel({ children, inP }) {
  return (
    <div style={{
      width: 660,
      opacity: clamp(inP * 1.7, 0, 1),
      transform: `translateX(${interpolate([0, 1], [110, 0])(inP)}px) perspective(1800px) rotateY(${interpolate([0, 1], [-16, -3.2])(inP)}deg)`,
      transformOrigin: '100% 50%',
      filter: `blur(${(1 - inP) * 14}px)`,
    }}>
      <div style={{
        background: PANEL, border: `1px solid ${HAIR}`, borderRadius: 22,
        padding: '38px 38px 34px', display: 'flex', flexDirection: 'column', gap: 30,
      }}>{children}</div>
    </div>
  );
}

function Header({ revealP }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <div style={{ width: interpolate([0, 1], [0, 26])(revealP), height: 3, background: AMBER }}></div>
        <div style={{
          fontFamily: MONO, fontSize: 20, letterSpacing: '0.20em', textTransform: 'uppercase',
          color: AMBER, fontWeight: 600, whiteSpace: 'nowrap',
          opacity: clamp(revealP * 2, 0, 1),
        }}>The truth</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {TRUTH_LINES.map(([text, w], i) => {
          const p = clamp((revealP - i * 0.16) / 0.55, 0, 1);
          return (
            <div key={i} style={{ position: 'relative', height: 46, display: 'flex', alignItems: 'center' }}>
              <div style={{
                position: 'absolute', left: 0, top: 9, width: w, height: 28, borderRadius: 5,
                background: 'oklch(0.30 0.010 62)', opacity: 1 - p,
              }}></div>
              <div style={{
                fontFamily: SANS, fontSize: 38, lineHeight: '46px', fontWeight: 800, color: INK,
                letterSpacing: '-0.02em', whiteSpace: 'nowrap',
                opacity: p, filter: `blur(${(1 - p) * 9}px)`,
                transform: `translateX(${(1 - p) * 10}px)`,
              }}>{text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LogoRow({ tiles }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        fontFamily: MONO, fontSize: 17, letterSpacing: '0.18em', textTransform: 'uppercase', color: DIM,
        opacity: clamp(tiles[0] * 2, 0, 1), whiteSpace: 'nowrap',
      }}>A typical Big Tech loop</div>
      <div style={{ display: 'flex', gap: 14 }}>
        {LOGOS.map(([src, name, fit], i) => {
          const p = tiles[i];
          if (p <= 0) return <div key={name} style={{ width: 104, height: 104 }}></div>;
          return (
            <div key={name} style={{
              width: 104, height: 104, borderRadius: 20, flex: '0 0 auto',
              background: '#ffffff', border: '1px solid oklch(0.86 0.006 80)',
              display: 'grid', placeItems: 'center', overflow: 'hidden',
              opacity: clamp(p * 2, 0, 1),
              transform: `scale(${interpolate([0, 1], [0.62, 1])(p)}) rotate(${interpolate([0, 1], [-9, 0])(p)}deg)`,
              filter: `blur(${(1 - p) * 7}px)`,
            }}>
              <img src={src} alt={name} style={{
                width: `${fit * 100}%`, height: `${fit * 100}%`, objectFit: 'contain', display: 'block',
              }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CheckList({ ticks }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        fontFamily: MONO, fontSize: 17, letterSpacing: '0.18em', textTransform: 'uppercase', color: DIM,
        opacity: clamp(ticks[0] > 0 ? 1 : 0, 0, 1), whiteSpace: 'nowrap',
      }}>How to be ready</div>
      {CHECKS.map((text, i) => {
        const p = ticks[i];
        const on = p > 0;
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            opacity: on ? clamp(p * 2.4, 0, 1) : 0.18,
            transform: `translateX(${(1 - clamp(p, 0, 1)) * 14}px)`,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flex: '0 0 auto',
              border: `2px solid ${p > 0.4 ? AMBER : HAIR}`,
              background: p > 0.4 ? AMBER : 'transparent',
              display: 'grid', placeItems: 'center',
              transform: `scale(${1 + (p > 0.4 ? Math.max(0, 1 - (p - 0.4) / 0.3) * 0.18 : 0)})`,
            }}>
              <svg width="22" height="22" viewBox="0 0 22 22" style={{ display: 'block' }}>
                <path d="M4 11.5 L9 16.5 L18 6.5" fill="none" stroke="oklch(0.19 0.03 76)" strokeWidth="3.2"
                  strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="26" strokeDashoffset={26 - clamp((p - 0.42) / 0.34, 0, 1) * 26} />
              </svg>
            </div>
            <div style={{
              fontFamily: SANS, fontSize: 27, lineHeight: '34px', fontWeight: 600,
              color: p > 0.4 ? INK : MUTED, whiteSpace: 'nowrap',
            }}>{text}</div>
          </div>
        );
      })}
    </div>
  );
}

function Stamp({ p }) {
  if (p <= 0) return null;
  const press = interpolate([0, 1], [1.5, 1])(p);
  const settle = 1 + Math.max(0, 1 - p / 0.35) * 0.0;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
      background: AMBER, borderRadius: 16, padding: '22px 26px',
      opacity: clamp(p * 3, 0, 1),
      transform: `scale(${press * settle}) rotate(${interpolate([0, 1], [-4, -1.2])(p)}deg)`,
      filter: `blur(${Math.max(0, 1 - p * 4) * 6}px)`,
    }}>
      <svg width="34" height="34" viewBox="0 0 22 22" style={{ display: 'block', flex: '0 0 auto' }}>
        <path d="M4 11.5 L9 16.5 L18 6.5" fill="none" stroke="oklch(0.19 0.03 76)" strokeWidth="3.4"
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="26" strokeDashoffset={26 - clamp((p - 0.2) / 0.4, 0, 1) * 26} />
      </svg>
      <div style={{
        fontFamily: MONO, fontSize: 27, letterSpacing: '0.16em', textTransform: 'uppercase',
        fontWeight: 700, color: 'oklch(0.19 0.03 76)', whiteSpace: 'nowrap',
      }}>Pass · first attempt</div>
    </div>
  );
}

function PromiseBroll(props) {
  const { T, CUES } = useComposition();

  const inP = animate({ from: 0, to: 1, start: CUES.Truth + 0.05, end: CUES.Truth + 1.05, ease: Easing.easeOutCubic })(T);
  const revealP = animate({ from: 0, to: 1, start: CUES.Truth + 0.55, end: CUES.Truth + 2.15, ease: Easing.easeOutCubic })(T);

  const tiles = LOGOS.map((_, i) =>
    animate({ from: 0, to: 1, start: CUES.BigTech + 0.12 + i * 0.17, end: CUES.BigTech + 0.82 + i * 0.17, ease: Easing.easeOutBack })(T)
  );

  const ticks = CHECKS.map((_, i) =>
    animate({ from: 0, to: 1, start: CUES.Prepare + 0.15 + i * 0.52, end: CUES.Prepare + 1.05 + i * 0.52, ease: Easing.easeOutCubic })(T)
  );

  const stampP = animate({ from: 0, to: 1, start: CUES.FirstTry + 0.25, end: CUES.FirstTry + 0.85, ease: Easing.easeOutCubic })(T);

  const drift = Math.sin(T * 0.7) * 5;
  const driftRot = Math.sin(T * 0.5) * 0.22;

  return (
    <div style={{
      position: 'absolute', left: 0, top: 0, width: 1920, height: 1080,
      transform: 'scale(2)', transformOrigin: '0 0', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', right: 78, top: 0, height: 1080,
        display: 'flex', alignItems: 'center',
        transform: `translateY(${drift}px) rotate(${driftRot}deg)`,
      }}>
        <Panel inP={inP}>
          <Header revealP={revealP} />
          <div style={{ height: 1, background: HAIR, opacity: clamp(tiles[0] * 2, 0, 1) }}></div>
          <LogoRow tiles={tiles} />
          <div style={{ height: 1, background: HAIR, opacity: clamp(ticks[0] * 2, 0, 1) }}></div>
          <CheckList ticks={ticks} />
          <Stamp p={stampP} />
        </Panel>
      </div>
    </div>
  );
}

window.PromiseBroll = PromiseBroll;
