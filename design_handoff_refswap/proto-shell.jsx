// proto-shell.jsx — header nav, mobile tab bar, shared chrome bits.

function Logo({ s = 22 }) {
  return (
    <span style={{ fontFamily: P.serif, fontWeight: 600, fontSize: s, letterSpacing: '.01em',
      color: P.ink, display: 'inline-flex', alignItems: 'baseline', userSelect: 'none' }}>
      Ref<span style={{ color: P.gold }}>Swap</span>
    </span>
  );
}

const NAV = [
  { key: 'browse',  label: 'Browse' },
  { key: 'mywatch', label: 'My Watch' },
  { key: 'matches', label: 'Matches',  dot: 'green' },
  { key: 'chat',    label: 'Messages', dot: 'red' },
];

function Header({ view, go, newMatches, unread }) {
  const dotFor = (k) => (k === 'matches' && newMatches > 0) ? P.green : (k === 'chat' && unread > 0) ? P.red : null;
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(251,250,248,.86)',
      backdropFilter: 'blur(10px)', borderBottom: `1px solid ${P.stroke}` }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 26px', height: 64 }}>
        <button onClick={() => go('browse')} style={{ all: 'unset', cursor: 'pointer' }}><Logo /></button>
        <nav className="desk-nav" style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
          {NAV.map((n) => {
            const active = view === n.key;
            const dot = dotFor(n.key);
            return (
              <button key={n.key} onClick={() => go(n.key)} style={{ all: 'unset', cursor: 'pointer',
                position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6,
                fontFamily: P.sans, fontSize: 13.5, paddingBottom: 4, color: active ? P.ink : P.ink2,
                borderBottom: `1.5px solid ${active ? P.gold : 'transparent'}`, transition: 'color .15s' }}>
                {n.label}
                {dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot }} />}
              </button>
            );
          })}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => go('create')} className="desk-nav" style={{ all: 'unset', cursor: 'pointer',
            fontFamily: P.sans, fontSize: 12.5, color: P.gold, border: `1px solid ${P.gold}66`,
            borderRadius: 6, padding: '7px 13px' }}>+ List a watch</button>
          <span className="desk-nav" style={{ fontFamily: P.sans, fontSize: 12.5, color: P.ink3, cursor: 'pointer' }}>Sign out</span>
        </div>
      </div>
    </header>
  );
}

function TabBar({ view, go, newMatches, unread }) {
  const tabs = [
    { key: 'browse',  label: 'Browse',  g: '◳' },
    { key: 'mywatch', label: 'My Watch', g: '⌚' },
    { key: 'matches', label: 'Matches', g: '⇄', dot: newMatches > 0 ? P.green : null },
    { key: 'chat',    label: 'Messages', g: '✉', dot: unread > 0 ? P.red : null },
  ];
  return (
    <nav className="tab-bar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
      display: 'none', background: 'rgba(251,250,248,.94)', backdropFilter: 'blur(10px)',
      borderTop: `1px solid ${P.stroke}`, padding: '8px 0 calc(8px + env(safe-area-inset-bottom))' }}>
      {tabs.map((t) => {
        const active = view === t.key;
        return (
          <button key={t.key} onClick={() => go(t.key)} style={{ all: 'unset', cursor: 'pointer', flex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 18, color: active ? P.gold : P.ink2, position: 'relative', lineHeight: 1 }}>
              {t.g}
              {t.dot && <span style={{ position: 'absolute', top: -2, right: -7, width: 6, height: 6, borderRadius: '50%', background: t.dot }} />}
            </span>
            <span style={{ fontFamily: P.sans, fontSize: 10, color: active ? P.gold : P.ink3 }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// section title block
function PageHead({ title, sub, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
        <h1 style={{ margin: 0, fontFamily: P.serif, fontWeight: 600, fontSize: 32, color: P.ink, lineHeight: 1, whiteSpace: 'nowrap' }}>{title}</h1>
        {sub && <span style={{ fontFamily: P.sans, fontSize: 13, color: P.ink3 }}>{sub}</span>}
      </div>
      {right}
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)', zIndex: 60,
      background: P.ink, color: '#fff', fontFamily: P.sans, fontSize: 13, padding: '11px 18px',
      borderRadius: 999, boxShadow: '0 10px 30px -10px rgba(0,0,0,.45)', animation: 'toastIn .25s ease' }}>
      {msg}
    </div>
  );
}

Object.assign(window, { Logo, Header, TabBar, PageHead, Toast, NAV });
