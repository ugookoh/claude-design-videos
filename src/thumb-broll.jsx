// resolve engine globals lazily — this module may evaluate before animations-v3.jsx
const useComposition = (...a) => window.useComposition(...a);
const animate = (...a) => window.animate(...a);
const interpolate = (...a) => window.interpolate(...a);
const clamp = (...a) => window.clamp(...a);
const Easing = new Proxy({}, { get: (_, k) => (window.Easing || {})[k] });

const ACCENT = 'oklch(0.78 0.15 75)';
const SANS = "'Satoshi', system-ui, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

const MOTION = {
  rise: (T, start) => {
    const p = animate({ from: 0, to: 1, start, end: start + 0.95, ease: Easing.easeOutCubic })(T);
    const s = animate({ from: 0, to: 1, start: start + 0.1, end: start + 1.25, ease: Easing.easeOutBack })(T);
    return { p, s };
  },
  drift: (T, phase) => ({
    y: Math.sin(T * 0.85 + phase) * 5,
    rot: Math.sin(T * 0.6 + phase) * 0.3,
  }),
  pop: (T, at) => {
    const p = animate({ from: 0, to: 1, start: at, end: at + 0.7, ease: Easing.easeOutQuad })(T);
    return Math.sin(p * Math.PI);
  },
};

function Kebab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '4px 2px', flex: '0 0 auto' }}>
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'oklch(0.80 0.012 70)' }}></div>
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'oklch(0.80 0.012 70)' }}></div>
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'oklch(0.80 0.012 70)' }}></div>
    </div>
  );
}

function ThumbCard({ T, start, popAt, img, kicker, title, meta, duration, progress, side }) {
  const { p, s } = MOTION.rise(T, start);
  const d = MOTION.drift(T, side === 'left' ? 0 : 2.1);
  const pulse = MOTION.pop(T, popAt);
  const dir = side === 'left' ? 1 : -1;

  // enters from fully off-frame so it never has to fade in over the key
  const ty = interpolate([0, 1], [900, 0])(p) + d.y * p;
  const tiltY = dir * interpolate([0, 1], [20, 6])(p);
  const tiltZ = -dir * (interpolate([0, 1], [8, 2.6])(p) + d.rot);
  const scale = interpolate([0, 1], [0.86, 1])(s) * (1 + pulse * 0.03);

  return (
    <div style={{
      width: 580,
      transform: `translateY(${ty}px) perspective(1500px) rotateY(${tiltY}deg) rotate(${tiltZ}deg) scale(${scale})`,
      transformOrigin: side === 'left' ? '100% 85%' : '0% 85%',
    }}>
      <div style={{
        background: 'oklch(0.17 0.008 60)',
        border: `${1 + Math.round(pulse * 2)}px solid ${pulse > 0.02 ? ACCENT : 'oklch(0.30 0.011 60)'}`,
        borderRadius: 18, padding: 14,
        boxShadow: `0 1px 0 oklch(1 0 0 / 0.05) inset`,
      }}>
        <div style={{
          position: 'relative', width: 552, height: 310, borderRadius: 12, overflow: 'hidden',
          background: 'oklch(0.24 0.010 60)',
        }}>
          <img src={img} alt="" style={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            transform: `scale(${1.04 + Math.sin(T * 0.35 + (side === 'left' ? 0 : 1.6)) * 0.02})`,
          }} />
          <div style={{
            position: 'absolute', left: 12, top: 12,
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(10,10,10,0.78)', border: '1px solid oklch(0.78 0.15 75 / 0.45)',
            padding: '5px 11px', borderRadius: 999,
            opacity: clamp((p - 0.4) * 2.6, 0, 1),
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT }}></div>
            <div style={{
              fontFamily: MONO, fontSize: 15, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: ACCENT, fontWeight: 600,
            }}>{kicker}</div>
          </div>
          <div style={{
            position: 'absolute', right: 10, bottom: 18,
            background: 'rgba(0,0,0,0.80)', color: '#fff', fontFamily: SANS, fontSize: 19, fontWeight: 600,
            padding: '3px 8px', borderRadius: 5,
          }}>{duration}</div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 5, background: 'rgba(255,255,255,0.22)' }}></div>
          <div style={{
            position: 'absolute', left: 0, bottom: 0, height: 5, width: `${progress}%`,
            background: '#ff0033',
          }}></div>
        </div>

        <div style={{
          display: 'flex', gap: 12, marginTop: 14, alignItems: 'flex-start',
          opacity: clamp((p - 0.45) * 2.6, 0, 1),
          transform: `translateY(${interpolate([0, 1], [12, 0])(clamp((p - 0.45) * 2.6, 0, 1))}px)`,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, flex: 1 }}>
            <div style={{
              fontFamily: SANS, fontSize: 23, lineHeight: '30px', fontWeight: 500, color: '#f1f1f1',
              letterSpacing: '-0.005em',
            }}>{title}</div>
            <div style={{
              fontFamily: SANS, fontSize: 18, lineHeight: '24px', color: 'oklch(0.66 0.010 65)',
            }}>{meta}</div>
          </div>
          <Kebab />
        </div>
      </div>
    </div>
  );
}

function ThumbBroll(props) {
  const { T, CUES } = useComposition();

  // authored in 1920x1080 units, scaled 2x onto the 3840x2160 stage (text and
  // chrome stay vector-sharp at 4K)
  return (
    <div style={{
      position: 'absolute', left: 0, top: 0, width: 1920, height: 1080,
      transform: 'scale(2)', transformOrigin: '0 0',
      display: 'grid', gridTemplateColumns: '1fr 620px 1fr', alignItems: 'center',
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 56 }}>
        <ThumbCard
          T={T} start={CUES.LeftIn + 0.25} popAt={CUES.Highlight + 0.1} side="left"
          img="assets/thumb-dayinthelife.jpg"
          kicker={props.leftKicker ?? 'Day in the life'}
          title={props.leftTitle ?? 'Moving Into My Dream Apartment | Living Alone in My 20s'}
          meta="52K views · 6 months ago"
          duration="18:23" progress={38}
        />
      </div>
      <div></div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 56 }}>
        <ThumbCard
          T={T} start={CUES.RightIn + 0.1} popAt={CUES.Highlight + 0.45} side="right"
          img="assets/thumb-informational.jpg"
          kicker={props.rightKicker ?? 'Informational'}
          title={props.rightTitle ?? 'How I Learnt to Code in 9 Months & Got a $250K Job!'}
          meta="26K views · 1 month ago"
          duration="28:46" progress={12}
        />
      </div>
    </div>
  );
}

window.ThumbBroll = ThumbBroll;
