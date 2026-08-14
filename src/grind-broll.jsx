// resolve engine globals lazily — this module may evaluate before animations-v3.jsx
const useComposition = (...a) => window.useComposition(...a);
const animate = (...a) => window.animate(...a);
const interpolate = (...a) => window.interpolate(...a);
const clamp = (...a) => window.clamp(...a);
const Easing = new Proxy({}, { get: (_, k) => (window.Easing || {})[k] });

const ACCENT = 'oklch(0.78 0.15 75)';
const SANS = "'Satoshi', system-ui, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";
const CARD_BG = 'oklch(0.17 0.008 60)';
const CARD_BD = 'oklch(0.30 0.011 60)';
const MUTED = 'oklch(0.68 0.010 65)';
const DIM = 'oklch(0.52 0.010 65)';
const REJECT = 'oklch(0.62 0.16 25)';

const rnd = (i, k) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const EVENTS = [
  ['Software Engineer I', 'Northbeam', 'Application submitted', 'neutral'],
  ['Backend Engineer', 'Corvid Labs', 'Application submitted', 'neutral'],
  ['SWE, New Grad', 'Halcyon', 'No response · 14 days', 'dim'],
  ['Platform Engineer', 'Meridian', 'Application submitted', 'neutral'],
  ['Software Engineer', 'Atelier Data', 'Not moving forward', 'reject'],
  ['Connection request', 'Eng Manager · Northbeam', 'Sent', 'dim'],
  ['SWE Intern → FT', 'Lumen Systems', 'Application submitted', 'neutral'],
  ['Backend Engineer', 'Halcyon', 'Not moving forward', 'reject'],
  ['Connection accepted', 'Senior SWE · Meridian', 'Accepted', 'accent'],
  ['Full Stack Engineer', 'Grayline', 'Application submitted', 'neutral'],
  ['Message sent', 'Senior SWE · Meridian', 'Delivered', 'dim'],
  ['SWE, Infrastructure', 'Corvid Labs', 'No response · 21 days', 'dim'],
  ['Software Engineer II', 'Northbeam', 'Not moving forward', 'reject'],
  ['Connection request', 'Recruiter · Lumen Systems', 'Sent', 'dim'],
  ['Backend Engineer', 'Pallas', 'Application submitted', 'neutral'],
  ['Message sent', 'Eng Manager · Northbeam', 'No reply', 'dim'],
  ['SWE, Distributed Systems', 'Meridian', 'Application submitted', 'neutral'],
  ['Software Engineer', 'Grayline', 'Not moving forward', 'reject'],
  ['Connection accepted', 'Staff SWE · Northbeam', 'Accepted', 'accent'],
  ['Backend Engineer', 'Halcyon', 'No response · 30 days', 'dim'],
  ['Message sent', 'Staff SWE · Northbeam', 'Read', 'dim'],
  ['SWE, Product', 'Pallas', 'Application submitted', 'neutral'],
  ['Software Engineer', 'Corvid Labs', 'Not moving forward', 'reject'],
  ['Coffee chat', 'Staff SWE · Northbeam', 'Scheduled', 'accent'],
  ['SWE, Core Platform', 'Northbeam', 'Application submitted', 'neutral'],
  ['Referral submitted', 'Staff SWE · Northbeam', 'Referral', 'accent'],
];

const TONE = {
  neutral: { dot: MUTED, text: MUTED, bd: CARD_BD },
  dim: { dot: DIM, text: DIM, bd: 'oklch(0.26 0.010 60)' },
  reject: { dot: REJECT, text: REJECT, bd: 'oklch(0.32 0.05 25)' },
  accent: { dot: ACCENT, text: ACCENT, bd: 'oklch(0.42 0.09 75)' },
};

function EventCard({ role, org, status, tone, blur, rot, tiltY }) {
  const t = TONE[tone];
  return (
    <div style={{
      width: 404, background: CARD_BG, border: `1px solid ${t.bd}`, borderRadius: 14,
      padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10,
      filter: `blur(${blur}px)`,
      transform: `perspective(1600px) rotateY(${tiltY}deg) rotate(${rot}deg)`,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ fontFamily: SANS, fontSize: 23, lineHeight: '28px', fontWeight: 700, color: '#f1f1f1', letterSpacing: '-0.01em' }}>{role}</div>
        <div style={{ fontFamily: SANS, fontSize: 18, lineHeight: '23px', color: DIM }}>{org}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.dot, flex: '0 0 auto' }}></div>
        <div style={{ fontFamily: MONO, fontSize: 15, letterSpacing: '0.11em', textTransform: 'uppercase', color: t.text, fontWeight: 500 }}>{status}</div>
      </div>
    </div>
  );
}

function Hud({ sent, replies, on }) {
  if (on <= 0) return null;
  return (
    <div style={{
      position: 'absolute', left: 96, top: 84, display: 'flex', flexDirection: 'column', gap: 28,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 22, height: 2, background: ACCENT }}></div>
          <div style={{ fontFamily: MONO, fontSize: 19, letterSpacing: '0.18em', textTransform: 'uppercase', color: ACCENT, fontWeight: 600 }}>Applications sent</div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 96, lineHeight: '104px', fontWeight: 600, color: '#f1f1f1', letterSpacing: '-0.02em' }}>{String(sent).padStart(3, '0')}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontFamily: MONO, fontSize: 19, letterSpacing: '0.18em', textTransform: 'uppercase', color: DIM, fontWeight: 600 }}>Replies</div>
        <div style={{ fontFamily: MONO, fontSize: 56, lineHeight: '62px', fontWeight: 600, color: replies > 0 ? ACCENT : DIM, letterSpacing: '-0.02em' }}>{String(replies).padStart(3, '0')}</div>
      </div>
    </div>
  );
}

function InviteCard({ T, start, popAt, subject, from, fromEmail }) {
  const p = animate({ from: 0, to: 1, start, end: start + 0.9, ease: Easing.easeOutCubic })(T);
  const s = animate({ from: 0, to: 1, start, end: start + 1.25, ease: Easing.easeOutBack })(T);
  const pulse = Math.sin(animate({ from: 0, to: 1, start: popAt, end: popAt + 0.7, ease: Easing.easeOutQuad })(T) * Math.PI);
  if (T < start) return null;

  const drift = Math.sin(T * 0.8) * 4;
  const ty = interpolate([0, 1], [150, 0])(p) + drift * p;
  const rot = interpolate([0, 1], [-3.2, -0.9])(p) + Math.sin(T * 0.55) * 0.22;
  const tiltY = interpolate([0, 1], [14, 3.4])(p);
  const scale = interpolate([0, 1], [0.88, 1])(s) * (1 + pulse * 0.022);

  return (
    <div style={{
      width: 1040,
      opacity: clamp(0.25 + p * 2.2, 0, 1),
      filter: `blur(${(1 - p) * 18}px)`,
      transform: `translateY(${ty}px) perspective(2000px) rotateY(${tiltY}deg) rotate(${rot}deg) scale(${scale})`,
      transformOrigin: '50% 90%',
    }}>
      <div style={{
        background: CARD_BG, border: `1px solid ${pulse > 0.02 ? ACCENT : CARD_BD}`, borderRadius: 20,
        outline: pulse > 0.02 ? `${pulse * 3}px solid oklch(0.78 0.15 75 / ${0.25 + pulse * 0.55})` : 'none',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 26px', borderBottom: `1px solid ${CARD_BD}`, background: 'oklch(0.20 0.009 60)',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: '0.18em', textTransform: 'uppercase', color: DIM, fontWeight: 600 }}>Inbox</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: ACCENT }}></div>
            <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: '0.18em', textTransform: 'uppercase', color: ACCENT, fontWeight: 600 }}>New</div>
          </div>
        </div>

        <div style={{ padding: '30px 34px 34px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 54, height: 54, borderRadius: '50%', flex: '0 0 auto',
              background: 'oklch(0.28 0.010 60)', border: `1px solid ${CARD_BD}`,
              display: 'grid', placeItems: 'center', fontFamily: MONO, fontSize: 21, fontWeight: 600, color: '#e8e8e8',
            }}>N</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontFamily: SANS, fontSize: 24, fontWeight: 700, color: '#f1f1f1' }}>{from}</div>
              <div style={{ fontFamily: MONO, fontSize: 18, color: DIM }}>{fromEmail}</div>
            </div>
          </div>

          <div style={{ fontFamily: SANS, fontSize: 46, lineHeight: '54px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', textWrap: 'pretty' }}>{subject}</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontFamily: SANS, fontSize: 23, lineHeight: '32px', color: MUTED }}>Hi Ugo — thanks for your patience. We'd like to move you forward to a</div>
            <div style={{ fontFamily: SANS, fontSize: 23, lineHeight: '32px', color: MUTED }}>full interview loop with the team. Pick a time that works for you.</div>
          </div>

          <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
            <div style={{
              fontFamily: SANS, fontSize: 21, fontWeight: 700, color: 'oklch(0.18 0.02 75)',
              background: ACCENT, padding: '15px 26px', borderRadius: 10,
            }}>Schedule interview</div>
            <div style={{
              fontFamily: SANS, fontSize: 21, fontWeight: 600, color: MUTED,
              border: `1px solid ${CARD_BD}`, padding: '15px 26px', borderRadius: 10,
            }}>View details</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GrindBroll(props) {
  const { T, CUES } = useComposition();

  const gStart = CUES.Grind1 + 0.15;
  const cut = CUES.Payoff;
  const pushAt = CUES.Push;
  const N = EVENTS.length;
  const PUSH_N = 3;
  const grindN = N - PUSH_N;
  const grindSpan = Math.max(pushAt - gStart, 0.1);

  const lanes = [606, 1036, 1466];
  const cards = [];
  let sentCount = 4;
  let replyCount = 0;

  for (let i = 0; i < N; i++) {
    const isPush = i >= grindN;
    const life = isPush ? 2.6 : interpolate([0, 1], [2.3, 1.3])(i / grindN);
    const spawn = isPush
      ? pushAt + (i - grindN) * 0.72 + 0.05
      : gStart + Math.pow(i / grindN, 0.74) * grindSpan;
    const p = (T - spawn) / life;

    if (T >= spawn) {
      sentCount = 4 + Math.round(interpolate([0, 1], [0, 210])(Math.pow((i + 1) / N, 1.35)));
      if (EVENTS[i][3] === 'accent') replyCount = Math.min(replyCount + 1, 9);
    }
    if (p < 0 || p > 1 || T >= cut) continue;

    const y = interpolate([0, 1], [1160, -230])(p) + (rnd(i, 5) - 0.5) * 60;
    const fade = Math.min(clamp(p / 0.06, 0, 1), clamp((1 - p) / 0.08, 0, 1));
    const lane = lanes[i % 3];
    const jx = (rnd(i, 3) - 0.5) * 36;
    const speedBlur = (1390 / life) / 300;

    cards.push(
      <div key={i} style={{
        position: 'absolute', left: lane + jx, top: y, opacity: fade,
      }}>
        <EventCard
          role={EVENTS[i][0]} org={EVENTS[i][1]} status={EVENTS[i][2]} tone={EVENTS[i][3]}
          blur={speedBlur} rot={(rnd(i, 7) - 0.5) * 4.4} tiltY={(rnd(i, 11) - 0.5) * 12}
        />
      </div>
    );
  }

  const hudOn = T < CUES.Payoff ? 1 : 0;

  return (
    <div style={{
      position: 'absolute', left: 0, top: 0, width: 1920, height: 1080,
      transform: 'scale(2)', transformOrigin: '0 0', overflow: 'hidden',
    }}>
      {cards}
      <Hud sent={sentCount} replies={replyCount} on={hudOn} />
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
        <InviteCard
          T={T} start={CUES.Payoff} popAt={CUES.Payoff + 1.6}
          subject={props.subject ?? 'Interview Invitation — Software Engineer'}
          from={props.fromName ?? 'Northbeam Recruiting'}
          fromEmail={props.fromEmail ?? 'recruiting@northbeam.io'}
        />
      </div>
    </div>
  );
}

window.GrindBroll = GrindBroll;
