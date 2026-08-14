const useComposition = (...a) => window.useComposition(...a);
const animate = (...a) => window.animate(...a);
const interpolate = (...a) => window.interpolate(...a);
const clamp = (...a) => window.clamp(...a);
const Easing = new Proxy({}, { get: (_, k) => (window.Easing || {})[k] });

const SANS = "'Satoshi', system-ui, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";
const AMBER = 'oklch(0.79 0.155 76)';
const INK = '#f4f2ef';
const MUTED = 'oklch(0.72 0.010 68)';
const DIM = 'oklch(0.55 0.010 66)';
const PANEL = 'oklch(0.185 0.008 62)';
const PANEL_2 = 'oklch(0.155 0.007 60)';
const HAIR = 'oklch(0.30 0.010 62)';

const WIN_W = 1280;
const WIN_H = 790;

const JOBS = [
  ['Northbeam', 'N', 'Software Engineer, Core Platform', 'San Francisco · Hybrid', '$185K – $250K',
    'You\'ll design and ship services at the center of our platform, working across storage, scheduling and the APIs the rest of the product is built on.',
    ['3+ years building production backend systems', 'Strong fundamentals in data structures and distributed design', 'Experience owning a service end to end']],
  ['Meridian', 'M', 'Backend Engineer, Payments', 'New York · Onsite', '$190K – $240K',
    'Own the ledger and settlement services that move money for thousands of merchants every day, where correctness matters more than speed.',
    ['Experience with transactional systems or double-entry ledgers', 'Comfortable with idempotency, retries and reconciliation', 'You write tests before you write the migration']],
  ['Corvid Labs', 'C', 'Software Engineer II, Infrastructure', 'Seattle · Remote', '$175K – $235K',
    'Build the compute layer every team here deploys onto — scheduling, autoscaling and the tooling that makes a rollback boring.',
    ['Deep familiarity with containers and orchestration', 'You have been on call and made it quieter', 'Go or Rust in production']],
  ['Lumen Systems', 'L', 'Full Stack Engineer, Growth', 'Austin · Hybrid', '$168K – $220K',
    'Ship experiments end to end — from the instrumentation to the interface — and be the person who can tell which number actually moved.',
    ['Strong product instincts and a bias to ship', 'React plus a real backend language', 'You have run an A/B test and read it honestly']],
  ['Pallas', 'P', 'Software Engineer, Distributed Systems', 'Boston · Onsite', '$195K – $255K',
    'Work on the replication and consensus layer underneath our storage engine, where a millisecond and a corrupted page both matter.',
    ['You have read the Raft paper and implemented something from it', 'Systems programming background', 'Comfortable reasoning about failure modes']],
  ['Grayline', 'G', 'Backend Engineer, Platform', 'Chicago · Remote', '$180K – $245K',
    'Turn a pile of internal services into a platform — clean interfaces, real ownership boundaries, and docs somebody would actually read.',
    ['Experience designing internal APIs other teams depend on', 'You care about developer experience', 'Pragmatic about migrations']],
  ['Halcyon', 'H', 'Software Engineer, Search', 'Remote · US', '$188K – $248K',
    'Own ranking and retrieval for a search product used millions of times a day, from the index build all the way to the latency budget.',
    ['Information retrieval or ranking experience', 'Strong grasp of caching and query performance', 'You have shipped a relevance change and measured it']],
];

const PEOPLE = [
  ['Maya Osei', 'M', 'Staff Engineer · Northbeam'],
  ['Dan Whitlock', 'D', 'Eng Manager · Meridian'],
  ['Priya Raman', 'P', 'Senior SWE · Corvid Labs'],
  ['Tomás Vega', 'T', 'Tech Lead · Lumen Systems'],
  ['Ada Nwosu', 'A', 'Staff Engineer · Pallas'],
  ['Kenji Mori', 'K', 'Recruiter · Grayline'],
];

const NOTE = 'Hey — I saw the Software Engineer opening on your team. I\'ve been building distributed systems for the last three years. Would you be open to a referral?';

function TrafficLights() {
  const dot = (c) => ({ width: 15, height: 15, borderRadius: '50%', background: c, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)' });
  return (
    <div style={{ display: 'flex', gap: 9, flex: '0 0 auto' }}>
      <div style={dot('#ff5f57')}></div>
      <div style={dot('#febc2e')}></div>
      <div style={dot('#28c840')}></div>
    </div>
  );
}

function Cursor({ x, y, scale, press }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: 0, height: 0, zIndex: 40,
      transform: `scale(${scale * (1 - press * 0.16)})`, transformOrigin: '0 0',
    }}>
      <svg width="40" height="52" viewBox="0 0 40 52" style={{ display: 'block', filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.55))' }}>
        <path d="M3 2 L3 40 L13 31 L20 47 L28 43 L21 28 L34 27 Z" fill="#ffffff" stroke="rgba(0,0,0,0.55)" strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Chip({ children, tone }) {
  const c = tone === 'accent'
    ? { bg: 'oklch(0.79 0.155 76 / 0.14)', bd: 'oklch(0.79 0.155 76 / 0.42)', fg: AMBER }
    : { bg: 'oklch(0.26 0.010 62)', bd: HAIR, fg: MUTED };
  return (
    <div style={{
      fontFamily: MONO, fontSize: 17, letterSpacing: '0.06em', color: c.fg,
      background: c.bg, border: `1px solid ${c.bd}`, borderRadius: 8, padding: '7px 12px', whiteSpace: 'nowrap',
    }}>{children}</div>
  );
}

function JobView({ job, pressed, swapBlur, swapSlide }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '40px 52px 0', display: 'flex', flexDirection: 'column', gap: 26, flex: 1,
        filter: `blur(${swapBlur}px)`,
        transform: `translateY(${swapSlide}px)`,
        opacity: clamp(1 - swapBlur / 9, 0.25, 1),
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18, flex: '0 0 auto',
            background: 'linear-gradient(160deg, oklch(0.34 0.012 62), oklch(0.24 0.010 60))',
            border: `1px solid ${HAIR}`, display: 'grid', placeItems: 'center',
            fontFamily: SANS, fontSize: 32, fontWeight: 900, color: INK,
          }}>{job[1]}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: '0.16em', textTransform: 'uppercase', color: DIM, whiteSpace: 'nowrap' }}>{job[0]} · Careers</div>
            <div style={{ fontFamily: SANS, fontSize: 25, fontWeight: 600, color: MUTED }}>Engineering</div>
          </div>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 52, lineHeight: '60px', fontWeight: 800, color: INK, letterSpacing: '-0.025em', textWrap: 'pretty' }}>{job[2]}</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Chip>{job[3]}</Chip>
          <Chip>Full-time</Chip>
          <Chip tone="accent">{job[4]}</Chip>
          <Chip>L4 · Mid-level</Chip>
        </div>
        <div style={{ height: 1, background: HAIR }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontFamily: SANS, fontSize: 23, lineHeight: '34px', color: MUTED, maxWidth: 980, textWrap: 'pretty' }}>{job[5]}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 4 }}>
            {job[6].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: DIM, flex: '0 0 auto' }}></div>
                <div style={{ fontFamily: SANS, fontSize: 21, lineHeight: '30px', color: DIM }}>{t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 18,
        padding: '26px 52px', borderTop: `1px solid ${HAIR}`, background: PANEL_2,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: 24, fontWeight: 700, color: 'oklch(0.20 0.03 76)',
          background: AMBER, borderRadius: 12, padding: '19px 40px', whiteSpace: 'nowrap',
          transform: `translateY(${pressed * 2}px) scale(${1 - pressed * 0.03})`,
          boxShadow: pressed > 0.5
            ? 'inset 0 2px 6px oklch(0.40 0.08 76 / 0.55)'
            : '0 10px 26px oklch(0.79 0.155 76 / 0.22)',
        }}>Apply now</div>
        <div style={{
          fontFamily: SANS, fontSize: 23, fontWeight: 600, color: MUTED,
          border: `1px solid ${HAIR}`, borderRadius: 12, padding: '18px 30px', whiteSpace: 'nowrap',
        }}>Save</div>
        <div style={{ flex: 1 }}></div>
        <div style={{ fontFamily: MONO, fontSize: 18, color: DIM, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>Posted 2 days ago</div>
      </div>
    </div>
  );
}

function MessagesView({ askedCount, threadIdx, justSent, composerType, sendPress, threadShift }) {
  const person = PEOPLE[clamp(threadIdx, 0, PEOPLE.length - 1)];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
      <div style={{ width: 404, borderRight: `1px solid ${HAIR}`, background: PANEL_2, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 22px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontFamily: SANS, fontSize: 27, fontWeight: 800, color: INK, letterSpacing: '-0.02em' }}>Messages</div>
          <div style={{
            fontFamily: SANS, fontSize: 19, color: DIM, background: 'oklch(0.23 0.009 60)',
            border: `1px solid ${HAIR}`, borderRadius: 10, padding: '12px 15px',
          }}>Search people</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {PEOPLE.map((p, i) => {
            const asked = i < askedCount;
            const active = i === threadIdx;
            const fresh = asked && i === askedCount - 1 && justSent > 0;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                background: active ? 'oklch(0.24 0.012 64)' : (fresh ? `oklch(0.79 0.155 76 / ${justSent * 0.10})` : 'transparent'),
                borderLeft: `3px solid ${active ? AMBER : 'transparent'}`,
              }}>
                <div style={{
                  width: 46, height: 46, borderRadius: '50%', flex: '0 0 auto',
                  background: 'oklch(0.29 0.010 62)', border: `1px solid ${asked ? 'oklch(0.79 0.155 76 / 0.55)' : HAIR}`,
                  display: 'grid', placeItems: 'center', fontFamily: SANS, fontSize: 19, fontWeight: 700, color: INK,
                }}>{p[1]}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0, flex: 1 }}>
                  <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: asked || active ? INK : MUTED }}>{p[0]}</div>
                  <div style={{ fontFamily: SANS, fontSize: 16, color: DIM, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p[2]}</div>
                </div>
                {asked && (
                  <div style={{
                    fontFamily: MONO, fontSize: 14, letterSpacing: '0.10em', textTransform: 'uppercase',
                    color: AMBER, flex: '0 0 auto',
                    transform: fresh ? `scale(${1 + justSent * 0.12})` : 'none',
                  }}>Asked</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '22px 30px', borderBottom: `1px solid ${HAIR}`, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: 'oklch(0.29 0.010 62)',
            border: `1px solid ${HAIR}`, display: 'grid', placeItems: 'center',
            fontFamily: SANS, fontSize: 18, fontWeight: 700, color: INK,
          }}>{person[1]}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, color: INK }}>{person[0]}</div>
            <div style={{ fontFamily: MONO, fontSize: 16, color: DIM, letterSpacing: '0.06em' }}>{person[2]}</div>
          </div>
          <div style={{ flex: 1 }}></div>
          <div style={{ fontFamily: MONO, fontSize: 15, letterSpacing: '0.12em', textTransform: 'uppercase', color: DIM, whiteSpace: 'nowrap' }}>New message</div>
        </div>
        <div style={{
          flex: 1, minHeight: 0, overflow: 'hidden', padding: '26px 30px',
          display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'flex-end',
          transform: `translateX(${threadShift}px)`, opacity: clamp(1 - Math.abs(threadShift) / 90, 0.15, 1),
        }}>
          {justSent > 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7,
              transform: `translateY(${(1 - justSent) * 26}px)`, opacity: justSent,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 15, letterSpacing: '0.10em', textTransform: 'uppercase', color: DIM }}>To {person[0]} · sent</div>
              <div style={{
                maxWidth: 620, fontFamily: SANS, fontSize: 20, lineHeight: '29px', color: 'oklch(0.19 0.03 76)',
                background: AMBER, borderRadius: '16px 16px 5px 16px', padding: '15px 19px',
              }}>{NOTE}</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <div style={{ fontFamily: SANS, fontSize: 21, color: DIM }}>No messages yet with {person[0]}</div>
              <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'oklch(0.42 0.010 64)' }}>Ask for a referral</div>
            </div>
          )}
        </div>
        <div style={{ padding: '20px 30px', borderTop: `1px solid ${HAIR}`, background: PANEL_2, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            flex: 1, minWidth: 0, height: 58, boxSizing: 'border-box',
            background: 'oklch(0.22 0.009 60)', border: `1px solid ${composerType > 0 ? 'oklch(0.42 0.014 64)' : HAIR}`, borderRadius: 12,
            padding: '0 18px', display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden',
          }}>
            <div style={{
              fontFamily: SANS, fontSize: 20, lineHeight: '28px', whiteSpace: 'nowrap',
              color: composerType > 0 ? MUTED : DIM, direction: 'rtl', textAlign: 'left',
              overflow: 'hidden', flex: '0 1 auto',
            }}><span style={{ direction: 'ltr', unicodeBidi: 'embed' }}>{composerType > 0 ? NOTE.slice(0, Math.round(composerType * NOTE.length)) : 'Write a message…'}</span></div>
            {composerType > 0 && (
              <div style={{
                width: 2, height: 24, background: AMBER, flex: '0 0 auto',
                opacity: Math.sin(composerType * 60) > 0 ? 1 : 0.15,
              }}></div>
            )}
          </div>
          <div style={{
            fontFamily: SANS, fontSize: 21, fontWeight: 700, color: 'oklch(0.20 0.03 76)',
            background: AMBER, borderRadius: 12, padding: '17px 30px', flex: '0 0 auto', whiteSpace: 'nowrap',
            transform: `translateY(${sendPress * 2}px) scale(${1 - sendPress * 0.04})`,
          }}>Send</div>
        </div>
      </div>
    </div>
  );
}

function InviteCard({ T, start, popAt, subject, from, fromEmail }) {
  const p = animate({ from: 0, to: 1, start, end: start + 1.0, ease: Easing.easeOutCubic })(T);
  const s = animate({ from: 0, to: 1, start, end: start + 1.35, ease: Easing.easeOutBack })(T);
  const pulse = Math.sin(animate({ from: 0, to: 1, start: popAt, end: popAt + 0.7, ease: Easing.easeOutQuad })(T) * Math.PI);
  if (T < start) return null;

  const drift = Math.sin(T * 0.8) * 4;
  const ty = interpolate([0, 1], [150, 0])(p) + drift * p;
  const rot = interpolate([0, 1], [-3.2, -0.9])(p) + Math.sin(T * 0.55) * 0.22;
  const tiltY = interpolate([0, 1], [14, 3.4])(p);
  const scale = interpolate([0, 1], [0.88, 1])(s) * (1 + pulse * 0.022);

  return (
    <div style={{
      width: 1120,
      opacity: clamp(0.2 + p * 2.2, 0, 1),
      filter: `blur(${(1 - p) * 18}px)`,
      transform: `translateY(${ty}px) perspective(2000px) rotateY(${tiltY}deg) rotate(${rot}deg) scale(${scale})`,
      transformOrigin: '50% 90%',
    }}>
      <div style={{
        background: PANEL, border: `1px solid ${pulse > 0.02 ? AMBER : HAIR}`, borderRadius: 22, overflow: 'hidden',
        boxShadow: `0 70px 150px rgba(0,0,0,0.66), 0 0 ${90 + pulse * 90}px oklch(0.79 0.155 76 / ${0.10 + pulse * 0.22}), inset 0 1px 0 rgba(255,255,255,0.07)`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 28px', borderBottom: `1px solid ${HAIR}`, background: 'linear-gradient(180deg, oklch(0.235 0.010 62), oklch(0.20 0.009 61))',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: '0.18em', textTransform: 'uppercase', color: DIM }}>Inbox</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: AMBER }}></div>
            <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: '0.18em', textTransform: 'uppercase', color: AMBER, fontWeight: 600 }}>New</div>
          </div>
        </div>
        <div style={{ padding: '32px 36px 36px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', flex: '0 0 auto',
              background: 'linear-gradient(160deg, oklch(0.32 0.012 62), oklch(0.24 0.010 60))', border: `1px solid ${HAIR}`,
              display: 'grid', placeItems: 'center', fontFamily: SANS, fontSize: 22, fontWeight: 800, color: INK,
            }}>N</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontFamily: SANS, fontSize: 25, fontWeight: 700, color: INK }}>{from}</div>
              <div style={{ fontFamily: MONO, fontSize: 18, color: DIM }}>{fromEmail}</div>
            </div>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 50, lineHeight: '58px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em', textWrap: 'pretty' }}>{subject}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontFamily: SANS, fontSize: 23, lineHeight: '33px', color: MUTED }}>Hi Ugo — thanks for your patience. We'd like to move you forward to a</div>
            <div style={{ fontFamily: SANS, fontSize: 23, lineHeight: '33px', color: MUTED }}>full interview loop with the team. Pick a time that works for you.</div>
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
            <div style={{
              fontFamily: SANS, fontSize: 22, fontWeight: 700, color: 'oklch(0.19 0.03 76)',
              background: AMBER, padding: '16px 28px', borderRadius: 11, whiteSpace: 'nowrap',
              boxShadow: '0 12px 30px oklch(0.79 0.155 76 / 0.25)',
            }}>Schedule interview</div>
            <div style={{
              fontFamily: SANS, fontSize: 22, fontWeight: 600, color: MUTED,
              border: `1px solid ${HAIR}`, padding: '16px 28px', borderRadius: 11, whiteSpace: 'nowrap',
            }}>View details</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplyConnectBroll(props) {
  const { T, CUES } = useComposition();

  const applyClicks = [0.35, 1.15, 1.82, 2.38, 2.86, 3.28].map((d) => CUES.ApplySpam + d);
  const sendClicks = [0.95, 1.55, 2.05, 2.50, 2.90, 3.26].map((d) => CUES.Connect + d);

  const appliedN = applyClicks.filter((t) => T >= t).length;
  const sentN = sendClicks.filter((t) => T >= t).length;

  const pressFor = (list) => {
    const t = list.reduce((best, x) => (Math.abs(T - x) < Math.abs(T - best) ? x : best), -99);
    const d = T - t;
    return d >= -0.05 && d < 0.16 ? 1 : 0;
  };

  const k = interpolate(
    [CUES.Establish, CUES.ZoomIn, CUES.ZoomIn + 1.5, CUES.ApplySpam + 3.5, CUES.Connect + 0.8, CUES.Connect + 3.9],
    [0.86, 0.90, 1.46, 1.46, 0.90, 0.92],
    Easing.easeInOutCubic
  )(T);
  const camAmt = clamp((k - 0.90) / 0.56, 0, 1);
  const btnX = -430, btnY = 300;
  const tx = -btnX * k * camAmt;
  const ty = -btnY * k * camAmt;
  const camDrift = Math.sin(T * 0.5) * 5;

  const inP = animate({ from: 0, to: 1, start: CUES.Establish + 0.1, end: CUES.Establish + 1.3, ease: Easing.easeOutCubic })(T);
  const winRot = interpolate([0, 1], [4.5, 0.9])(inP) - camAmt * 0.75;

  const swap = animate({ from: 0, to: 1, start: CUES.Connect - 0.2, end: CUES.Connect + 0.5, ease: Easing.easeInOutCubic })(T);
  const out = animate({ from: 0, to: 1, start: CUES.Payoff - 0.1, end: CUES.Payoff + 0.9, ease: Easing.easeInOutCubic })(T);

  const lastApply = applyClicks.filter((t) => T >= t).pop();
  const sinceApply = lastApply === undefined ? 99 : T - lastApply;
  const swapBlur = sinceApply < 0.26 ? interpolate([0, 0.26], [9, 0])(sinceApply) : 0;
  const swapSlide = sinceApply < 0.26 ? interpolate([0, 0.26], [34, 0])(sinceApply) : 0;
  const job = JOBS[Math.min(appliedN, JOBS.length - 1)];

  const lastSend = sendClicks.filter((t) => T >= t).pop();
  const sinceSend = lastSend === undefined ? 99 : T - lastSend;
  const dwell = 0.30;
  const inDwell = sinceSend < dwell;
  const threadIdx = inDwell ? sentN - 1 : Math.min(sentN, PEOPLE.length - 1);
  const justSent = inDwell ? clamp(sinceSend / 0.12, 0, 1) : 0;
  const threadShift = sinceSend >= dwell && sinceSend < dwell + 0.22
    ? interpolate([dwell, dwell + 0.22], [70, 0])(sinceSend)
    : 0;

  const nextSend = sendClicks.find((t) => T < t);
  const typeFrom = lastSend === undefined ? CUES.Connect + 0.25 : lastSend + dwell;
  const composerType = nextSend === undefined || T < typeFrom || inDwell ? 0
    : clamp(interpolate([typeFrom, nextSend - 0.04], [0, 1])(T), 0, 1);

  const applyBtn = { x: 176, y: 690 };
  const sendBtn = { x: 1140, y: 706 };
  const jitter = (n) => ((Math.sin(n * 91.7) * 43758.5453) % 1) * 16;
  const cur = (() => {
    if (T < CUES.Connect - 0.1) {
      const p = animate({ from: 0, to: 1, start: CUES.ZoomIn + 0.15, end: CUES.ZoomIn + 1.35, ease: Easing.easeInOutCubic })(T);
      return {
        x: interpolate([0, 1], [1090, applyBtn.x])(p) + jitter(appliedN + 1),
        y: interpolate([0, 1], [820, applyBtn.y])(p) + jitter(appliedN + 7) * 0.5,
        on: p,
      };
    }
    const p = animate({ from: 0, to: 1, start: CUES.Connect + 0.15, end: CUES.Connect + 0.8, ease: Easing.easeInOutCubic })(T);
    return {
      x: interpolate([0, 1], [applyBtn.x, sendBtn.x])(p) + jitter(sentN + 3),
      y: interpolate([0, 1], [applyBtn.y, sendBtn.y])(p) + jitter(sentN + 11) * 0.4,
      on: clamp(1 - out * 3, 0, 1),
    };
  })();
  const press = T < CUES.Connect ? pressFor(applyClicks) : pressFor(sendClicks);

  const ripSrc = T < CUES.Connect ? applyClicks : sendClicks;
  const ripT = ripSrc.filter((t) => T >= t).pop();
  const ripP = ripT === undefined ? 1 : clamp((T - ripT) / 0.5, 0, 1);

  return (
    <div style={{
      position: 'absolute', left: 0, top: 0, width: 1920, height: 1080,
      transform: 'scale(2)', transformOrigin: '0 0', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
        transform: `translate(${tx}px, ${ty + camDrift}px) scale(${k * (1 - out * 0.10)})`,
        opacity: 1 - out,
        filter: `blur(${out * 16}px)`,
      }}>
        <div style={{
          position: 'relative', width: WIN_W, height: WIN_H,
          opacity: clamp(inP * 1.8, 0, 1),
          transform: `translateY(${interpolate([0, 1], [120, 0])(inP)}px) perspective(2600px) rotateY(${winRot}deg) rotateX(${interpolate([0, 1], [3, 0.4])(inP)}deg)`,
          filter: `blur(${(1 - inP) * 14}px)`,
        }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 22, overflow: 'hidden',
            background: PANEL, border: '1px solid oklch(0.36 0.011 62)',
            boxShadow: '0 70px 140px rgba(0,0,0,0.62), 0 10px 34px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 20, height: 62, padding: '0 22px',
              background: 'linear-gradient(180deg, oklch(0.255 0.010 62), oklch(0.215 0.009 61))',
              borderBottom: `1px solid ${HAIR}`,
            }}>
              <TrafficLights />
              <div style={{
                flex: 1, maxWidth: 560, margin: '0 auto',
                background: 'oklch(0.175 0.008 60)', border: `1px solid ${HAIR}`, borderRadius: 9,
                padding: '8px 16px', fontFamily: MONO, fontSize: 17, color: DIM,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center',
              }}>{swap > 0.5 ? 'messages · referrals' : `careers.${job[0].toLowerCase().replace(/\s+/g, '')}.com/apply`}</div>
              <div style={{ width: 60, flex: '0 0 auto' }}></div>
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 62, bottom: 0 }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 1 - swap, transform: `scale(${1 - swap * 0.04})`, filter: `blur(${swap * 10}px)` }}>
                <JobView job={job} pressed={T < CUES.Connect ? press : 0} swapBlur={swapBlur} swapSlide={swapSlide} />
              </div>
              <div style={{ position: 'absolute', inset: 0, opacity: swap, transform: `scale(${0.96 + swap * 0.04})`, filter: `blur(${(1 - swap) * 10}px)` }}>
                {swap > 0.02 && (
                  <MessagesView
                    askedCount={sentN}
                    threadIdx={threadIdx}
                    justSent={justSent}
                    composerType={composerType}
                    sendPress={T >= CUES.Connect ? press : 0}
                    threadShift={threadShift}
                  />
                )}
              </div>
            </div>
          </div>

          {ripP < 1 && (
            <div style={{ position: 'absolute', left: cur.x, top: cur.y, width: 0, height: 0, zIndex: 35 }}>
              <div style={{
                position: 'absolute', left: -60, top: -60, width: 120, height: 120, borderRadius: '50%',
                border: `2px solid oklch(0.79 0.155 76 / ${(1 - ripP) * 0.75})`,
                transform: `scale(${0.25 + ripP * 0.85})`,
              }}></div>
            </div>
          )}

          {cur.on > 0.02 && <Cursor x={cur.x} y={cur.y} scale={(1 / k) * 1.05 * cur.on} press={press} />}
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 76, top: 68, display: 'flex', alignItems: 'center', gap: 26,
        background: 'oklch(0.16 0.008 60 / 0.82)', border: `1px solid ${HAIR}`, borderRadius: 16,
        padding: '18px 26px', backdropFilter: 'blur(14px)',
        opacity: 1 - out,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: '0.18em', textTransform: 'uppercase', color: DIM }}>Applications</div>
          <div style={{ fontFamily: MONO, fontSize: 40, lineHeight: '44px', fontWeight: 600, color: INK }}>{String(61 + appliedN).padStart(3, '0')}</div>
        </div>
        <div style={{ width: 1, height: 52, background: HAIR }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: '0.18em', textTransform: 'uppercase', color: DIM }}>Referrals asked</div>
          <div style={{ fontFamily: MONO, fontSize: 40, lineHeight: '44px', fontWeight: 600, color: sentN > 0 ? AMBER : INK }}>{String(sentN).padStart(2, '0')}</div>
        </div>
      </div>

      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
        <InviteCard
          T={T} start={CUES.Payoff + 0.35} popAt={CUES.Payoff + 2.0}
          subject={props.subject ?? 'Interview Invitation — Software Engineer'}
          from={props.fromName ?? 'Northbeam Recruiting'}
          fromEmail={props.fromEmail ?? 'recruiting@northbeam.io'}
        />
      </div>
    </div>
  );
}

window.ApplyConnectBroll = ApplyConnectBroll;
