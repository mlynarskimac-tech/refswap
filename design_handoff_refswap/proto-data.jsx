// proto-data.jsx — shared palette, data, tiny primitives for the clickable prototype.

const P = {
  bg:      '#FBFAF8',
  bgTint:  '#F3F1EC',
  surface: '#FFFFFF',
  surface2:'#F0EEE9',
  stroke:  '#E2DED6',
  strokeMd:'#D4CFC5',
  ink:     '#1C1B19',
  ink2:    '#6E6A62',
  ink3:    '#A6A199',
  gold:    '#A9823F',
  goldSoft:'#EFE3CC',
  green:   '#3F9D6E',
  red:     '#D24B4B',
  serif:   "'Cormorant Garamond', serif",
  sans:    "'Inter', system-ui, sans-serif",
  mono:    "'Spline Sans Mono', ui-monospace, monospace",
};

const TIERS = {
  Entry: { label: 'Entry Luxury', range: '€3–6k' },
  Mid:   { label: 'Mid Luxury',   range: '€6–12k' },
  High:  { label: 'High Luxury',  range: '€12–25k' },
  Ultra: { label: 'Ultra Luxury', range: '€25–50k' },
};

// the browse floor — anonymous until matched
const WATCHES = [
  { id: 'w1', brand: 'Patek Philippe', model: 'Nautilus 5711/1A', ref: '5711/1A-010', tier: 'Ultra', country: 'DE', flag: '🇩🇪', topup: true,  scope: 'EU', wants: ['AP Royal Oak', 'Lange Odysseus'] },
  { id: 'w2', brand: 'Rolex',          model: 'Submariner Date',   ref: '126610LN',    tier: 'High',  country: 'GB', flag: '🇬🇧', topup: false, scope: 'Worldwide', wants: ['Omega Speedmaster', 'Tudor Pelagos'] },
  { id: 'w3', brand: 'Omega',          model: 'Speedmaster Pro',   ref: '310.30.42',   tier: 'Mid',   country: 'US', flag: '🇺🇸', topup: true,  scope: 'US only', wants: ['Tudor Black Bay', 'Sinn 356'] },
  { id: 'w4', brand: 'Cartier',        model: 'Santos Large',      ref: 'WSSA0009',    tier: 'High',  country: 'GB', flag: '🇬🇧', topup: true,  scope: 'EU', wants: ['JLC Reverso', 'Cartier Tank'] },
  { id: 'w5', brand: 'Tudor',          model: 'Black Bay 58',      ref: '79030N',      tier: 'Entry', country: 'DE', flag: '🇩🇪', topup: true,  scope: 'EU', wants: ['Oris Diver', 'Longines Legend'] },
  { id: 'w6', brand: 'IWC',            model: 'Portugieser Auto',  ref: 'IW500712',    tier: 'High',  country: 'US', flag: '🇺🇸', topup: false, scope: 'Worldwide', wants: ['JLC Master', 'Zenith Chronomaster'] },
  { id: 'w7', brand: 'A. Lange & Söhne', model: 'Saxonia Thin',    ref: '205.086',     tier: 'Ultra', country: 'DE', flag: '🇩🇪', topup: false, scope: 'EU', wants: ['Patek Calatrava', 'VC Patrimony'] },
  { id: 'w8', brand: 'Grand Seiko',    model: 'Snowflake SBGA211', ref: 'SBGA211',     tier: 'Mid',   country: 'GB', flag: '🇬🇧', topup: true,  scope: 'Worldwide', wants: ['Omega Aqua Terra', 'Rolex OP'] },
  { id: 'w9', brand: 'Jaeger-LeCoultre', model: 'Reverso Classic', ref: 'Q3858520',    tier: 'High',  country: 'US', flag: '🇺🇸', topup: true,  scope: 'US only', wants: ['Cartier Tank', 'Lange Saxonia'] },
];

// the user's own listing
const MY_WATCH = {
  brand: 'Rolex', model: 'Submariner Date', ref: '126610LN', tier: 'High',
  country: 'GB', flag: '🇬🇧', topup: true, scope: 'EU shipping', active: true,
  wants: ['AP Royal Oak', 'Patek Aquanaut', 'Omega Speedmaster'],
};

// mutual matches (identity revealed)
const MATCHES = [
  { id: 'm1', name: 'Henrik L.', country: 'DE', flag: '🇩🇪', theirs: 'w1', mine: 'Submariner', time: '2h ago', unseen: true,
    msgs: [
      { me: false, t: 'Hi — love your Submariner. Would you consider the Nautilus straight, or do you need a top-up?', at: '14:02' },
      { me: true,  t: 'Hey Henrik! Open to it. The 5711 is the grail. What top-up were you thinking?', at: '14:09' },
      { me: false, t: 'Given current market I’d ask around €18k on top. Happy to do escrow + insured shipping.', at: '14:15' },
    ] },
  { id: 'm2', name: 'Marcus W.', country: 'GB', flag: '🇬🇧', theirs: 'w4', mine: 'Submariner', time: 'Yesterday', unseen: false,
    msgs: [
      { me: false, t: 'Santos for your Sub — interested? Both UK so easy meet in person.', at: '11:20' },
    ] },
  { id: 'm3', name: 'Dana R.', country: 'US', flag: '🇺🇸', theirs: 'w6', mine: 'Submariner', time: '3 days ago', unseen: false,
    msgs: [] },
];

// ---------- tiny primitives ----------
function PhotoBox({ label = '', h = 160, w = '100%', r = 8, big, style }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: r, position: 'relative', overflow: 'hidden',
      background: `radial-gradient(120% 90% at 50% 18%, #FFFFFF 0%, #F4F1EC 55%, #ECE8E1 100%)`,
      border: `1px solid ${P.stroke}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style }}>
      {/* faux watch silhouette so it reads as a product shot, not an empty box */}
      <div style={{ width: big ? 118 : 84, height: big ? 118 : 84, borderRadius: '50%',
        border: `2px solid ${P.strokeMd}`, background: 'linear-gradient(150deg,#fff,#EDE9E2)',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,.05), 0 6px 16px -10px rgba(0,0,0,.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: big ? 70 : 50, height: big ? 70 : 50, borderRadius: '50%',
          border: `1px solid ${P.stroke}`, background: '#FCFBF9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: P.mono, fontSize: 8, color: P.ink3, letterSpacing: '.1em' }}>1:00</div>
      </div>
      {label && <span style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center',
        fontFamily: P.mono, fontSize: 8.5, letterSpacing: '.14em', textTransform: 'uppercase', color: P.ink3 }}>{label}</span>}
    </div>
  );
}

function TierBadge({ level = 'Mid', solid }) {
  return (
    <span style={{
      fontFamily: P.mono, fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase',
      color: solid ? '#fff' : P.gold, border: `1px solid ${P.gold}${solid ? '' : '55'}`, borderRadius: 4,
      padding: '4px 8px', background: solid ? P.gold : `${P.gold}14`, whiteSpace: 'nowrap' }}>{level}</span>
  );
}

function Flag({ flag, code }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: P.sans, fontSize: 12, color: P.ink2 }}>
      <span style={{ fontSize: 13, fontFamily: P.mono, letterSpacing: '.06em' }}>{code}</span>
    </span>
  );
}

function AnonToken({ size = 26 }) {
  return (
    <span title="Anonymous until you match" style={{ width: size, height: size, borderRadius: '50%',
      border: `1px solid ${P.strokeMd}`, background: P.surface2, display: 'inline-flex',
      alignItems: 'center', justifyContent: 'center', color: P.ink3, fontSize: size * 0.5 }}>◍</span>
  );
}

Object.assign(window, { P, TIERS, WATCHES, MY_WATCH, MATCHES, PhotoBox, TierBadge, Flag, AnonToken });
