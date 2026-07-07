// proto-browse.jsx — Browse grid, watch card, detail drawer.
const { useState: useStateB } = React;

function WatchCard({ w, liked, onLike, onOpen }) {
  return (
    <div onClick={onOpen} style={{ cursor: 'pointer', background: P.surface,
      border: `1px solid ${liked ? P.gold + '88' : P.stroke}`, borderRadius: 12, overflow: 'hidden',
      boxShadow: liked ? `0 10px 30px -14px ${P.gold}77` : '0 10px 26px -18px rgba(0,0,0,.4)',
      transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
      <div style={{ position: 'relative' }}>
        <PhotoBox h={188} r={0} label="photo" />
        <span style={{ position: 'absolute', top: 12, left: 12 }}><TierBadge level={w.tier} /></span>
        <button onClick={(e) => { e.stopPropagation(); onLike(); }} aria-label="Like" style={{ all: 'unset',
          cursor: 'pointer', position: 'absolute', top: 10, right: 10, width: 38, height: 38, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          background: liked ? P.gold : 'rgba(255,255,255,.9)', color: liked ? '#fff' : P.ink2,
          border: `1px solid ${liked ? P.gold : P.stroke}`, boxShadow: liked ? `0 0 0 5px ${P.gold}22` : '0 2px 8px -2px rgba(0,0,0,.2)',
          transition: 'all .16s ease' }}>{liked ? '♥' : '♡'}</button>
      </div>
      <div style={{ padding: '14px 15px 15px' }}>
        <div style={{ fontFamily: P.mono, fontSize: 10, letterSpacing: '.08em', color: P.ink3, textTransform: 'uppercase' }}>{w.brand}</div>
        <div style={{ fontFamily: P.serif, fontSize: 21, fontWeight: 600, color: P.ink, marginTop: 3 }}>{w.model}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 13 }}>
          <Flag flag={w.flag} code={w.country} />
          <span style={{ width: 1, height: 12, background: P.stroke }} />
          {w.topup && <span title="Open to top-up" style={{ color: P.gold, fontSize: 13 }}>⇅</span>}
          <span style={{ fontFamily: P.sans, fontSize: 11.5, color: P.ink2 }}>{w.scope}</span>
          <span style={{ flex: 1 }} />
          <AnonToken size={22} />
        </div>
      </div>
    </div>
  );
}

const FILTERS = [
  { key: 'tier', label: 'Any tier', options: ['Any tier', 'Entry', 'Mid', 'High', 'Ultra'] },
  { key: 'geo',  label: 'Anywhere', options: ['Anywhere', 'DE', 'GB', 'US'] },
];

function Browse({ liked, toggleLike, openWatch }) {
  const [tier, setTier] = useStateB('Any tier');
  const [geo, setGeo] = useStateB('Anywhere');
  const [topupOnly, setTopupOnly] = useStateB(false);

  const list = WATCHES.filter((w) =>
    (tier === 'Any tier' || w.tier === tier) &&
    (geo === 'Anywhere' || w.country === geo) &&
    (!topupOnly || w.topup));

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 26px 40px' }}>
      <PageHead title="Browse the floor"
        sub={`${list.length} watches open to swap · identities hidden until you match`} />
      {/* filter bar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', margin: '20px 0 0',
        paddingBottom: 18, borderBottom: `1px solid ${P.stroke}` }}>
        <Dropdown label="Price tier" value={tier} setValue={setTier} options={FILTERS[0].options} />
        <Dropdown label="Geography" value={geo} setValue={setGeo} options={FILTERS[1].options} />
        <button onClick={() => setTopupOnly(v => !v)} style={{ all: 'unset', cursor: 'pointer',
          fontFamily: P.sans, fontSize: 12.5, borderRadius: 999, padding: '8px 14px',
          border: `1px solid ${topupOnly ? P.gold : P.stroke}`, color: topupOnly ? P.gold : P.ink2,
          background: topupOnly ? `${P.gold}12` : 'transparent', display: 'inline-flex', gap: 6 }}>
          ⇅ Open to top-up</button>
        <span style={{ flex: 1 }} />
        {(tier !== 'Any tier' || geo !== 'Anywhere' || topupOnly) &&
          <button onClick={() => { setTier('Any tier'); setGeo('Anywhere'); setTopupOnly(false); }}
            style={{ all: 'unset', cursor: 'pointer', fontFamily: P.sans, fontSize: 12.5, color: P.ink3 }}>Clear ✕</button>}
      </div>
      {/* grid */}
      <div className="browse-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 22 }}>
        {list.map((w) => (
          <WatchCard key={w.id} w={w} liked={liked.has(w.id)} onLike={() => toggleLike(w)} onOpen={() => openWatch(w)} />
        ))}
      </div>
      {list.length === 0 &&
        <div style={{ textAlign: 'center', padding: '60px 0', color: P.ink3, fontFamily: P.sans }}>
          No watches match these filters.
        </div>}
    </div>
  );
}

function Dropdown({ label, value, setValue, options }) {
  const [open, setOpen] = useStateB(false);
  const isDefault = value === options[0];
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ all: 'unset', cursor: 'pointer',
        fontFamily: P.sans, fontSize: 12.5, borderRadius: 999, padding: '8px 14px',
        border: `1px solid ${isDefault ? P.stroke : P.gold}`, color: isDefault ? P.ink2 : P.gold,
        background: isDefault ? 'transparent' : `${P.gold}12`, display: 'inline-flex', gap: 8 }}>
        {isDefault ? label : value} <span style={{ opacity: .6 }}>▾</span></button>
      {open &&
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 18 }} />
          <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 19, background: P.surface,
            border: `1px solid ${P.stroke}`, borderRadius: 10, padding: 6, minWidth: 150,
            boxShadow: '0 16px 40px -16px rgba(0,0,0,.35)' }}>
            {options.map((o) => (
              <button key={o} onClick={() => { setValue(o); setOpen(false); }} style={{ all: 'unset', cursor: 'pointer',
                display: 'block', width: '100%', boxSizing: 'border-box', fontFamily: P.sans, fontSize: 13,
                padding: '8px 10px', borderRadius: 7, color: value === o ? P.gold : P.ink,
                background: value === o ? `${P.gold}10` : 'transparent' }}>{o}</button>
            ))}
          </div>
        </>}
    </div>
  );
}

// detail drawer (slides over) ----------------------------------------------
function WatchDrawer({ w, liked, toggleLike, onClose }) {
  if (!w) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(28,27,25,.34)', animation: 'fadeIn .2s ease' }} />
      <div style={{ position: 'relative', width: 'min(440px, 92vw)', height: '100%', background: P.bg,
        borderLeft: `1px solid ${P.stroke}`, boxShadow: '-20px 0 50px -20px rgba(0,0,0,.4)', overflowY: 'auto',
        animation: 'slideIn .28s cubic-bezier(.2,.8,.2,1)' }}>
        <div style={{ position: 'sticky', top: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 18px', background: 'rgba(251,250,248,.9)', backdropFilter: 'blur(8px)', borderBottom: `1px solid ${P.stroke}` }}>
          <span style={{ fontFamily: P.mono, fontSize: 10.5, letterSpacing: '.12em', color: P.ink3, textTransform: 'uppercase' }}>Listing detail</span>
          <button onClick={onClose} style={{ all: 'unset', cursor: 'pointer', fontSize: 18, color: P.ink2, lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: 18 }}>
          <PhotoBox h={260} big label="watch photo · 1 / 4" />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {[0,1,2,3].map(i => <PhotoBox key={i} h={56} w={56} r={6} />)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 18, gap: 12 }}>
            <div>
              <div style={{ fontFamily: P.mono, fontSize: 10.5, letterSpacing: '.08em', color: P.ink3, textTransform: 'uppercase' }}>{w.brand}</div>
              <div style={{ fontFamily: P.serif, fontSize: 27, fontWeight: 600, color: P.ink, marginTop: 3 }}>{w.model}</div>
            </div>
            <TierBadge level={w.tier} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginTop: 20 }}>
            {[['Reference', w.ref], ['Price tier', TIERS[w.tier].range], ['Location', `${w.flag} ${w.country}`], ['Geographic scope', w.scope], ['Open to top-up', w.topup ? 'Yes ⇅' : 'Straight swap']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ fontFamily: P.mono, fontSize: 9.5, letterSpacing: '.07em', color: P.ink3, textTransform: 'uppercase' }}>{k}</span>
                <span style={{ fontFamily: P.sans, fontSize: 14.5, color: P.ink, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: P.stroke, margin: '20px 0' }} />
          <span style={{ fontFamily: P.mono, fontSize: 9.5, letterSpacing: '.07em', color: P.ink3, textTransform: 'uppercase' }}>Wants in return</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {w.wants.map(t => <span key={t} style={{ fontFamily: P.sans, fontSize: 12, color: P.ink2,
              border: `1px solid ${P.stroke}`, borderRadius: 999, padding: '6px 12px' }}>{t}</span>)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: P.surface2, borderRadius: 10,
            padding: '12px 14px', marginTop: 22 }}>
            <AnonToken size={30} />
            <span style={{ fontFamily: P.sans, fontSize: 12.5, color: P.ink2, lineHeight: 1.4 }}>
              Owner stays anonymous until you both like each other’s watch.</span>
          </div>
          <button onClick={() => toggleLike(w)} style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
            marginTop: 18, width: '100%', textAlign: 'center', fontFamily: P.sans, fontSize: 15, fontWeight: 600,
            padding: '14px 0', borderRadius: 10, color: liked.has(w.id) ? P.gold : '#fff',
            background: liked.has(w.id) ? `${P.gold}16` : P.gold,
            border: `1px solid ${P.gold}` }}>
            {liked.has(w.id) ? '♥  Liked — waiting for them' : '♡  Like this watch'}</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WatchCard, Browse, WatchDrawer, Dropdown });
