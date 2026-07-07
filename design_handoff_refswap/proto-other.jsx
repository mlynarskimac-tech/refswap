// proto-other.jsx — My Watch, Matches, Chat, Create Listing.
const { useState: useStateO, useRef: useRefO, useEffect: useEffectO } = React;

// ---------- My Watch ----------
function MyWatch({ go }) {
  const w = MY_WATCH;
  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 26px 40px' }}>
      <PageHead title="My listing" right={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: P.sans, fontSize: 13,
          color: P.green, border: `1px solid ${P.green}44`, background: `${P.green}10`, borderRadius: 999, padding: '7px 14px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: P.green }} /> Active</span>
      } />
      <div className="mywatch-grid" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 30, marginTop: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PhotoBox h={320} big label="watch photo · main" />
          <div style={{ display: 'flex', gap: 10 }}>
            {[0,1,2].map(i => <PhotoBox key={i} h={74} r={8} />)}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: P.mono, fontSize: 11, letterSpacing: '.1em', color: P.ink3, textTransform: 'uppercase' }}>{w.brand} · {TIERS[w.tier].label}</div>
          <div style={{ fontFamily: P.serif, fontSize: 30, fontWeight: 600, color: P.ink, margin: '6px 0 18px' }}>{w.model}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 26px', maxWidth: 460 }}>
            {[['Reference', w.ref], ['Price tier', TIERS[w.tier].range], ['Geographic scope', w.scope], ['Open to top-up', w.topup ? 'Yes ⇅' : 'Straight swap']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontFamily: P.mono, fontSize: 9.5, letterSpacing: '.07em', color: P.ink3, textTransform: 'uppercase' }}>{k}</span>
                <span style={{ fontFamily: P.sans, fontSize: 15, color: P.ink, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: P.stroke, margin: '22px 0' }} />
          <span style={{ fontFamily: P.mono, fontSize: 9.5, letterSpacing: '.07em', color: P.ink3, textTransform: 'uppercase' }}>Wanted in return</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {w.wants.map(t => <span key={t} style={{ fontFamily: P.sans, fontSize: 12.5, color: P.ink2, border: `1px solid ${P.stroke}`, borderRadius: 999, padding: '6px 12px' }}>{t}</span>)}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <button onClick={() => go('create')} style={{ all: 'unset', cursor: 'pointer', fontFamily: P.sans, fontSize: 13.5,
              color: P.gold, border: `1px solid ${P.gold}`, borderRadius: 8, padding: '11px 20px' }}>Edit listing</button>
            <button style={{ all: 'unset', cursor: 'pointer', fontFamily: P.sans, fontSize: 13.5,
              color: P.red, border: `1px solid ${P.red}55`, borderRadius: 8, padding: '11px 20px' }}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Matches ----------
function Matches({ matches, openChat }) {
  const newCount = matches.filter(m => m.unseen).length;
  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 26px 40px' }}>
      <PageHead title="Matches" sub="Mutual likes. Identity revealed — now you can talk." right={
        newCount > 0 && <span style={{ fontFamily: P.sans, fontSize: 12, color: '#fff', background: P.green, borderRadius: 999, padding: '5px 12px', fontWeight: 600 }}>{newCount} new</span>
      } />
      {matches.length === 0 ? <MatchesEmpty /> :
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>
          {matches.map((m) => {
            const theirs = WATCHES.find(x => x.id === m.theirs);
            return (
              <button key={m.id} onClick={() => openChat(m)} style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
                display: 'flex', alignItems: 'center', gap: 18, width: '100%', background: P.surface,
                border: `1px solid ${m.unseen ? P.green + '66' : P.stroke}`, borderRadius: 12, padding: 14,
                boxShadow: '0 8px 22px -18px rgba(0,0,0,.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <PhotoBox h={58} w={74} r={8} label="" />
                  <span style={{ color: P.gold, fontSize: 18 }}>⇄</span>
                  <PhotoBox h={58} w={74} r={8} label="" />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ fontFamily: P.sans, fontSize: 15.5, fontWeight: 600, color: P.ink }}>{m.name}</span>
                    <Flag flag={m.flag} code={m.country} />
                    {m.unseen && <span style={{ width: 8, height: 8, borderRadius: '50%', background: P.green }} />}
                  </div>
                  <span style={{ fontFamily: P.sans, fontSize: 12, color: P.ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {theirs ? theirs.model : 'Their watch'} ⇄ your {m.mine} · {m.time}</span>
                </div>
                <span className="match-cta" style={{ fontFamily: P.sans, fontSize: 13, color: P.gold, border: `1px solid ${P.gold}66`, borderRadius: 8, padding: '9px 15px', whiteSpace: 'nowrap' }}>Open chat →</span>
              </button>
            );
          })}
        </div>}
    </div>
  );
}

function MatchesEmpty() {
  return (
    <div style={{ marginTop: 40, border: `1px dashed ${P.strokeMd}`, borderRadius: 16, padding: '60px 24px',
      textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 40, color: P.ink3 }}>⌚</span>
      <span style={{ fontFamily: P.serif, fontSize: 24, color: P.ink }}>No matches yet</span>
      <span style={{ fontFamily: P.sans, fontSize: 13.5, color: P.ink3, maxWidth: 320, lineHeight: 1.5 }}>
        When someone likes your watch back, they’ll appear here — and you’ll be able to chat and arrange the swap.</span>
    </div>
  );
}

// ---------- Chat ----------
function Chat({ matches, activeId, openChat, sendMsg }) {
  const m = matches.find(x => x.id === activeId) || matches[0];
  const endRef = useRefO(null);
  const [draft, setDraft] = useStateO('');
  useEffectO(() => { endRef.current?.scrollTo?.(0, endRef.current.scrollHeight); }, [m?.msgs.length, activeId]);

  if (!m) return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px' }}>
      <PageHead title="Messages" />
      <MatchesEmpty />
    </div>
  );
  const theirs = WATCHES.find(x => x.id === m.theirs);
  const send = () => { if (!draft.trim()) return; sendMsg(m.id, draft.trim()); setDraft(''); };

  return (
    <div className="chat-wrap" style={{ maxWidth: 1180, margin: '0 auto', padding: '20px 26px 30px',
      display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>
      {/* conversation list */}
      <div className="chat-list" style={{ background: P.surface, border: `1px solid ${P.stroke}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '13px 16px', borderBottom: `1px solid ${P.stroke}`, fontFamily: P.serif, fontSize: 18, color: P.ink }}>Messages</div>
        {matches.map((c) => {
          const active = c.id === m.id;
          return (
            <button key={c.id} onClick={() => openChat(c)} style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
              display: 'flex', gap: 10, alignItems: 'center', width: '100%', padding: '12px 16px',
              borderBottom: `1px solid ${P.stroke}`, background: active ? P.surface2 : 'transparent' }}>
              <PhotoBox h={38} w={38} r={8} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: P.sans, fontSize: 13.5, fontWeight: 600, color: P.ink }}>{c.name}</div>
                <div style={{ fontFamily: P.sans, fontSize: 11, color: P.ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.msgs.length ? c.msgs[c.msgs.length - 1].t : 'Say hello 👋'}</div>
              </div>
              {c.unseen && <span style={{ width: 8, height: 8, borderRadius: '50%', background: P.green }} />}
            </button>
          );
        })}
      </div>
      {/* thread */}
      <div style={{ background: P.surface, border: `1px solid ${P.stroke}`, borderRadius: 12, display: 'flex', flexDirection: 'column', height: 'min(72vh, 640px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${P.stroke}` }}>
          <PhotoBox h={40} w={40} r={8} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: P.sans, fontSize: 14.5, fontWeight: 600, color: P.ink }}>{m.name} <span style={{ color: P.ink3, fontWeight: 400, fontSize: 12 }}>· {m.country}</span></div>
            <div style={{ fontFamily: P.sans, fontSize: 11.5, color: P.ink3 }}>{theirs ? theirs.model : 'Their watch'} ⇄ your {m.mine}</div>
          </div>
          <button style={{ all: 'unset', cursor: 'pointer', fontFamily: P.sans, fontSize: 12, color: P.red }}>⚑ Report</button>
        </div>
        <div ref={endRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ textAlign: 'center', fontFamily: P.mono, fontSize: 9.5, letterSpacing: '.12em', color: P.ink3 }}>— MATCHED · {m.time.toUpperCase()} —</div>
          {m.msgs.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.me ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '72%', padding: '10px 14px', borderRadius: 14,
                borderBottomRightRadius: msg.me ? 4 : 14, borderBottomLeftRadius: msg.me ? 14 : 4,
                background: msg.me ? P.goldSoft : P.surface2, border: `1px solid ${msg.me ? P.gold + '40' : P.stroke}` }}>
                <div style={{ fontFamily: P.sans, fontSize: 13.5, color: P.ink, lineHeight: 1.45 }}>{msg.t}</div>
                <div style={{ fontFamily: P.sans, fontSize: 9.5, color: P.ink3, textAlign: 'right', marginTop: 5 }}>{msg.at}</div>
              </div>
            </div>
          ))}
          {m.msgs.length === 0 && <div style={{ textAlign: 'center', color: P.ink3, fontFamily: P.sans, fontSize: 13, marginTop: 20 }}>No messages yet — break the ice.</div>}
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '12px 16px', borderTop: `1px solid ${P.stroke}`, alignItems: 'center' }}>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            placeholder="Message…" style={{ flex: 1, height: 42, border: `1px solid ${P.stroke}`, borderRadius: 999,
            padding: '0 18px', fontFamily: P.sans, fontSize: 13.5, color: P.ink, background: P.bg, outline: 'none' }} />
          <button onClick={send} style={{ all: 'unset', cursor: 'pointer', fontFamily: P.sans, fontSize: 13.5, fontWeight: 600,
            color: '#fff', background: P.gold, borderRadius: 999, padding: '0 22px', height: 42, display: 'inline-flex', alignItems: 'center' }}>Send</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MyWatch, Matches, MatchesEmpty, Chat });
