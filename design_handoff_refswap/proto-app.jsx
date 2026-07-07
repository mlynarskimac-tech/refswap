// proto-app.jsx — top-level state, navigation, match logic.
const { useState, useEffect, useCallback } = React;

// watches whose owner has ALREADY liked your Submariner — liking these = instant match
const LIKES_YOU = {
  w3: { name: 'Sofia M.', country: 'US', flag: '🇺🇸' },
  w5: { name: 'Jonas B.', country: 'DE', flag: '🇩🇪' },
  w8: { name: 'Will T.',  country: 'GB', flag: '🇬🇧' },
};

const LS = 'refswap-proto-v1';
function loadState() {
  try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch { return {}; }
}

function App() {
  const saved = loadState();
  const [view, setView] = useState(saved.view || 'browse');
  const [liked, setLiked] = useState(new Set(saved.liked || []));
  const [matches, setMatches] = useState(saved.matches || MATCHES);
  const [activeChat, setActiveChat] = useState(saved.activeChat || (MATCHES[0] && MATCHES[0].id));
  const [drawer, setDrawer] = useState(null);
  const [toast, setToast] = useState('');

  // persist
  useEffect(() => {
    localStorage.setItem(LS, JSON.stringify({ view, liked: [...liked], matches, activeChat }));
  }, [view, liked, matches, activeChat]);

  const flash = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(''), 2600); }, []);

  const newMatches = matches.filter(m => m.unseen).length;
  const unread = matches.reduce((n, m) => n + (m.msgs.some(x => !x.me && m.unseen) ? 1 : 0), 0);

  const go = (v) => { setView(v); window.scrollTo(0, 0); };

  const toggleLike = (w) => {
    setLiked(prev => {
      const nx = new Set(prev);
      if (nx.has(w.id)) { nx.delete(w.id); return nx; }
      nx.add(w.id);
      // mutual-like → match
      const who = LIKES_YOU[w.id];
      if (who && !matches.some(m => m.theirs === w.id)) {
        const nm = { id: 'mx-' + w.id, name: who.name, country: who.country, flag: who.flag,
          theirs: w.id, mine: 'Submariner', time: 'just now', unseen: true, msgs: [] };
        setMatches(ms => [nm, ...ms]);
        setTimeout(() => flash(`It’s a match! You can now chat with ${who.name}.`), 80);
      } else {
        flash('Liked — we’ll tell you if it’s mutual.');
      }
      return nx;
    });
  };

  const openChat = (m) => {
    setActiveChat(m.id);
    setMatches(ms => ms.map(x => x.id === m.id ? { ...x, unseen: false } : x));
    setView('chat'); window.scrollTo(0, 0);
  };

  const sendMsg = (id, text) => {
    setMatches(ms => ms.map(m => m.id === id
      ? { ...m, msgs: [...m.msgs, { me: true, t: text, at: nowTime() }] }
      : m));
    // canned reply after a beat
    setTimeout(() => {
      setMatches(ms => ms.map(m => m.id === id
        ? { ...m, msgs: [...m.msgs, { me: false, t: pickReply(), at: nowTime() }] }
        : m));
    }, 1400);
  };

  return (
    <div style={{ minHeight: '100vh', background: P.bg, paddingBottom: 70 }}>
      <Header view={view} go={go} newMatches={newMatches} unread={unread} />
      <main>
        {view === 'browse'  && <Browse liked={liked} toggleLike={toggleLike} openWatch={setDrawer} />}
        {view === 'mywatch' && <MyWatch go={go} />}
        {view === 'matches' && <Matches matches={matches} openChat={openChat} />}
        {view === 'chat'    && <Chat matches={matches} activeId={activeChat} openChat={openChat} sendMsg={sendMsg} />}
        {view === 'create'  && <CreateListing go={go} onPublish={() => { flash('Listing published ✓'); go('mywatch'); }} />}
      </main>
      <WatchDrawer w={drawer} liked={liked} toggleLike={(w) => { toggleLike(w); }} onClose={() => setDrawer(null)} />
      <TabBar view={view} go={go} newMatches={newMatches} unread={unread} />
      <Toast msg={toast} />
    </div>
  );
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
const REPLIES = [
  'Sounds good — let me think on the numbers and revert shortly.',
  'Appreciate it. Can you share a couple more wrist shots?',
  'I’m flexible on shipping. Escrow works for me.',
  'Let’s make it happen. What’s your timeline?',
];
let rIdx = 0;
function pickReply() { return REPLIES[(rIdx++) % REPLIES.length]; }

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
