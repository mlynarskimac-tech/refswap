# Handoff: RefSwap — peer-to-peer luxury watch exchange

## Overview
RefSwap is a "Tinder for watches" — a matching platform for swapping luxury watches (€3k–€50k).
A user lists **one watch they own** plus a **wishlist of references they'd swap it for**. When two users
mutually like each other's watch, it's a **match** — identities are revealed and they can chat and
negotiate the exchange (with an optional cash top-up to balance the deal).

Markets: UK, Germany, USA. Aesthetic: **light luxury** — warm off-white, generous whitespace, serif
display + clean sans body, gold used sparingly for key actions and active states.

## About the Design Files
The files in this bundle (`proto-*.jsx` + `RefSwap Prototype.html`) are **design references built in
HTML/React-via-CDN** — a clickable prototype showing the intended look, layout, copy, and behavior.
They are **not production code to ship**. They use React + Babel loaded from a CDN and transpiled in the
browser, with **mock/hard-coded data** and **faked logic** (the "it's a match" trigger and chat replies
are simulated client-side; state lives in `localStorage`).

**Your task:** recreate these designs **1:1** in the target codebase's real environment — i.e. a proper
React project (Vite or Next.js recommended) wired to the user's existing backend/API — preserving every
visual detail, color, font, spacing, radius, shadow, and interaction described below. Replace all mock
data and faked logic with real API calls.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, and interactions are intentional and exact.
Recreate the UI pixel-perfectly. All exact values are in **Design Tokens** below and in `proto-data.jsx`.

---

## Design Tokens

### Colors (exact hex — defined in `proto-data.jsx` as object `P`)
| Token | Hex | Use |
|---|---|---|
| `bg` | `#FBFAF8` | App background (warm off-white) |
| `bgTint` | `#F3F1EC` | Subtle tinted panels |
| `surface` | `#FFFFFF` | Cards, drawers, inputs background base |
| `surface2` | `#F0EEE9` | Raised/alt surface, skeleton fill, hover row |
| `stroke` | `#E2DED6` | Default borders/dividers |
| `strokeMd` | `#D4CFC5` | Slightly stronger border |
| `ink` | `#1C1B19` | Primary text |
| `ink2` | `#6E6A62` | Secondary text |
| `ink3` | `#A6A199` | Tertiary text / placeholders / muted icons |
| `gold` | `#A9823F` | Primary accent: logo "Swap", active nav, like-on, primary buttons, highlights |
| `goldSoft` | `#EFE3CC` | Sent chat bubble background |
| `green` | `#3F9D6E` | New-match indicators, "Active" status, match dots |
| `red` | `#D24B4B` | Unread indicator, Report, Delete |

Accent helpers used inline: `${gold}10`/`12`/`14`/`16`/`18`/`22`/`40`/`44`/`55`/`66`/`77`/`88` are the
gold hex with an **alpha hex suffix** (e.g. `#A9823F18`). Same pattern for green/red. Keep these.

### Typography
- **Serif (display):** `'Cormorant Garamond', serif` — weights 500/600/700. Used for: logo, page `<h1>`,
  watch model names, tier card titles, empty-state headings, "Messages" panel header.
- **Sans (body/UI):** `'Inter', system-ui, sans-serif` — weights 400/500/600. Default for all UI text.
- **Mono (labels):** `'Spline Sans Mono', ui-monospace, monospace` — small uppercase eyebrow labels,
  field keys, country codes, tier badges, timestamps-style microcopy.
- Google Fonts import: `Cormorant+Garamond:wght@500;600;700`, `Inter:wght@400;500;600`,
  `Spline+Sans+Mono:wght@400;500`.

Representative sizes (px): page `<h1>` 32/serif/600; watch model on card 21/serif/600; model in
drawer 27/serif; brand eyebrow 10 mono uppercase `.08em`; body 13–15 sans; microcopy 11–12; mono field
keys 9.5–10.5 uppercase letter-spacing `.07–.12em`. Antialiased (`-webkit-font-smoothing: antialiased`).

### Radius
Cards/drawers `12px`; large containers (create card) `14px`; pills/chips/buttons `8–10px`; fully round
elements (filter chips, send button, dots, like button) `999px`/`50%`; thumbnails `6–8px`.

### Shadows
- Card default: `0 10px 26px -18px rgba(0,0,0,.4)`
- Card liked: `0 10px 30px -14px #A9823F77`
- Drawer: `-20px 0 50px -20px rgba(0,0,0,.4)`
- Dropdown menu: `0 16px 40px -16px rgba(0,0,0,.35)`
- Toast: `0 10px 30px -10px rgba(0,0,0,.45)`
- Like button (on): `0 0 0 5px #A9823F22` (soft ring)

### Spacing
Page content max-width **1180px**, centered, horizontal padding 26px. Create-listing column max-width
**760px**. Grid gaps 20px (browse), 30px (my-watch), 12–14px (lists). Header height **64px**.

### Motion (keyframes in `RefSwap Prototype.html` `<style>`)
- `fadeIn` 0.2s (drawer scrim)
- `slideIn` 0.28s `cubic-bezier(.2,.8,.2,1)` (drawer panel from +28px right)
- `toastIn` 0.25s (toast rises 10px)
- Card hover: `translateY(-3px)`, transition `.18s ease` on transform/box-shadow/border.
- Like button transition `all .16s ease`.

---

## Screens / Views

Single-page app; one persistent **Header** on top, content swaps by `view` state. On ≤880px the header
nav is replaced by a fixed **bottom TabBar**.

### Header (`proto-shell.jsx` → `Header`)
- Sticky, `rgba(251,250,248,.86)` + `backdrop-filter: blur(10px)`, bottom border `stroke`, height 64.
- Left: **logo** "Ref" (ink) + "Swap" (gold), Cormorant 600, 22px — clicks → Browse.
- Center nav (desktop, class `desk-nav`): Browse · My Watch · Matches · Messages. Active item = ink text
  + 1.5px gold underline; inactive = `ink2`. Matches shows a **green dot** when there are new matches;
  Messages shows a **red dot** when unread. Gap 30px.
- Right: `+ List a watch` (gold outline button) + `Sign out` (muted text).

### Bottom TabBar (mobile, `proto-shell.jsx` → `TabBar`)
- Fixed bottom, blurred bg, top border. 4 tabs (Browse ◳ / My Watch ⌚ / Matches ⇄ / Messages ✉) with
  glyph + label; active = gold; green/red dot badges as in header. Shown only ≤880px (CSS toggles).

### 1. Browse (`proto-browse.jsx` → `Browse`)
- **Purpose:** scan the floor of available watches (anonymous pre-match), filter, like, open detail.
- **PageHead:** `<h1>` "Browse the floor" (white-space nowrap) + subtitle
  `"{N} watches open to swap · identities hidden until you match"`.
- **Filter bar:** row, bottom border. Two **Dropdown** pills ("Price tier" → Any/Entry/Mid/High/Ultra,
  "Geography" → Anywhere/DE/GB/US) + a **toggle chip** "⇅ Open to top-up". When any filter active, a
  selected pill turns gold (`gold` border, `${gold}12` bg) and a "Clear ✕" text button appears at the
  far right. Filtering is live on the list.
- **Grid:** `repeat(3,1fr)`, gap 20 (class `browse-grid`). Responsive: 2 cols ≤880px, 1 col ≤560px.
- **WatchCard:** white, radius 12, border `stroke` (→ `gold88` when liked), card shadow (→ gold glow when
  liked), hover lifts 3px.
  - Photo area (188px) with **TierBadge** top-left and circular **Like button** top-right.
  - Like button: 38px circle. Off = white bg, `ink2` heart `♡`, stroke border. On = gold bg, white `♥`,
    gold soft ring shadow. Click **stops propagation** (doesn't open detail).
  - Body: brand eyebrow (mono uppercase, ink3) → model (Cormorant 21) → meta row: country code (mono),
    1px divider, `⇅` gold if top-up, scope text (ink2), spacer, small **AnonToken** ◍.
  - Clicking the card (anywhere but the heart) opens the **WatchDrawer**.
- Empty filtered result → centered "No watches match these filters."

### WatchDrawer (`proto-browse.jsx` → `WatchDrawer`)
- Right-side drawer over scrim. Width `min(440px, 92vw)`, full height, scrollable, slideIn animation.
- Sticky sub-bar: "Listing detail" eyebrow + ✕ close.
- Big PhotoBox (260, label "watch photo · 1 / 4") + 4 thumbnail boxes.
- Brand eyebrow + model (Cormorant 27) + TierBadge.
- 2-col detail grid: Reference, Price tier (€ range from `TIERS`), Location (`flag code`), Geographic
  scope, Open to top-up ("Yes ⇅" / "Straight swap").
- Divider → "Wants in return" chips.
- Anonymity note box (`surface2`): AnonToken + "Owner stays anonymous until you both like each other's
  watch."
- Full-width like button: off = gold fill/white "♡ Like this watch"; on = `${gold}16` bg/gold text
  "♥ Liked — waiting for them".

### 2. My Watch (`proto-other.jsx` → `MyWatch`)
- **Purpose:** view/manage the user's own active listing.
- PageHead "My listing" + right **status pill** ("● Active", green) — design also supports Inactive.
- 2-col grid `380px 1fr` (stacks ≤880px, class `mywatch-grid`): left = big PhotoBox (320) + 3 thumbs;
  right = brand·tier eyebrow, model (Cormorant 30), 2-col detail grid (Reference, Price tier, Geographic
  scope, Open to top-up), divider, "Wanted in return" chips, then **Edit listing** (gold outline) +
  **Delete** (red outline) buttons. Edit → Create flow.

### 3. Matches (`proto-other.jsx` → `Matches`)
- **Purpose:** list mutual matches (identity revealed), open chat.
- PageHead "Matches" + subtitle "Mutual likes. Identity revealed — now you can talk." + green "{N} new"
  badge when applicable.
- Each match = full-width button row, white card, border green-tinted if unseen. Left: **both watches**
  (yours PhotoBox ⇄ theirs PhotoBox with gold ⇄). Middle: name (sans 600) + country code + green dot if
  unseen; sub line "{their model} ⇄ your {mine} · {time}". Right: "Open chat →" gold outline (hidden
  ≤560px via `.match-cta`). Click → opens chat, marks seen.
- **Empty state** (`MatchesEmpty`): dashed rounded box, ⌚ glyph, "No matches yet" (Cormorant 24),
  explanatory copy. Reused as the Messages empty state too.

### 4. Chat / Messages (`proto-other.jsx` → `Chat`)
- **Purpose:** converse and negotiate with a match.
- 2-col grid `260px 1fr` (class `chat-wrap`); left **conversation list** hidden ≤880px (`.chat-list`).
- Conversation list: "Messages" header (Cormorant 18), rows = thumb + name + last-message preview +
  green dot if unseen; active row `surface2`.
- Thread panel: header (thumb, name + country, "{their model} ⇄ your {mine}", **⚑ Report** red, right).
  Body scrollable, height `min(72vh, 640px)`. Centered "— MATCHED · {time} —" mono divider.
  - **Message bubbles:** theirs = left, `surface2` bg, `stroke` border, bottom-left corner squared (4px).
    Mine = right, `goldSoft` bg, `${gold}40` border, bottom-right corner squared. Each bubble: text
    (sans 13.5, line-height 1.45) + right-aligned time (sans 9.5, ink3).
  - Composer: rounded text input ("Message…", Enter sends) + gold "Send" pill. Auto-scrolls to bottom.

### 5. Create Listing (`proto-create.jsx` → `CreateListing`)
- **Purpose:** step-by-step listing creation.
- Max-width 760. PageHead "Create a listing" + subtitle.
- **Stepper** (8 steps): Brand · Model · Reference · Photos · Price tier · Scope · Top-up · Wishlist.
  Each step = numbered circle + label; clickable to jump. Done = gold check on `${gold}18`; current =
  solid gold/white; future = `strokeMd`/`ink3`. Connectors = 16px gray lines.
- Card (`surface`, radius 14, min-height 280): "Step {n} · {name}" eyebrow + the active step's control:
  - Brand/Model/Reference → labeled **TextInput** (height 46, radius 10).
  - **Photos** → dashed drop zone (⤓, "Drag & drop photos", "or click to add · up to 8") + thumbnail
    row with "+" tile; clicking adds a placeholder.
  - **Price tier** → 2×2 grid of selectable cards: Entry €3–6k, Mid €6–12k, High €12–25k, Ultra €25–50k.
    Selected = gold border + `${gold}10` bg + gold serif title.
  - **Scope** → ChoiceRow [EU, US only, Worldwide].
  - **Top-up** → ChoiceRow [Yes, No] with hint.
  - **Wishlist** → TextInput + Add button, removable chips.
- Footer: "← Back" (outline) / "Continue →" (gold) — last step button reads "Publish listing".
  Publish → toast "Listing published ✓" → go to My Watch. Back from step 0 → My Watch.

---

## Interactions & Behavior
- **Navigation:** `view` state switches screens; `go(v)` also `window.scrollTo(0,0)`. URL routing is NOT
  in the prototype — **add real routes** (`/browse`, `/my-watch`, `/matches`, `/messages/:id`,
  `/create`) when rebuilding.
- **Like → match:** `toggleLike(w)` adds/removes id from a `Set`. In the prototype, watch ids in
  `LIKES_YOU` simulate "they already liked you" → instantly creates a match + toast "It's a match! You
  can now chat with {name}." Otherwise toast "Liked — we'll tell you if it's mutual." **In production the
  backend decides mutuality** (see API Contract).
- **Chat send:** appends user bubble, then a **canned reply after 1.4s** — this is fake. Replace with
  real send + realtime receive (WebSocket/SSE).
- **Toast:** transient bottom-center pill, auto-dismiss 2.6s.
- **Persistence:** prototype saves `{view, liked, matches, activeChat}` to `localStorage` key
  `refswap-proto-v1`. Replace with server state.
- **Responsive:** ≤880px → 2-col browse, stacked my-watch, chat list hidden, desktop nav hidden, bottom
  tab bar shown, body bottom padding for tab bar. ≤560px → 1-col browse, hide match "Open chat" CTA.

## State Management
Prototype top-level state (`proto-app.jsx` → `App`): `view`, `liked: Set<watchId>`,
`matches: Match[]`, `activeChat: matchId`, `drawer: Watch|null`, `toast: string`.
Derived: `newMatches` (count unseen), `unread`. For production, back these with server data + auth'd
fetches; keep the same shape so components don't change.

## Data Model (from `proto-data.jsx`)
- **Watch:** `{ id, brand, model, ref, tier: 'Entry'|'Mid'|'High'|'Ultra', country: 'DE'|'GB'|'US',
  flag, topup: bool, scope: 'EU'|'US only'|'Worldwide', wants: string[] }`
- **TIERS:** `{ Entry:{label,range:'€3–6k'}, Mid:{…'€6–12k'}, High:{…'€12–25k'}, Ultra:{…'€25–50k'} }`
- **MyWatch:** like Watch + `{ active: bool }`.
- **Match:** `{ id, name, country, flag, theirs: watchId, mine: string, time, unseen: bool,
  msgs: { me: bool, t: string, at: 'HH:MM' }[] }`

## Suggested API Contract (to replace the mocks)
- `POST /auth/login` → token; attach `Authorization: Bearer …` to all calls.
- `GET /watches?tier=&geo=&topup=` → `Watch[]` (anonymized; no owner identity).
- `POST /likes { watchId }` → `{ liked: bool, matched: bool, match?: Match }`.
- `GET /matches` → `Match[]`.
- `GET /matches/:id/messages` → `Message[]`; `POST /matches/:id/messages { text }` → `Message`.
- Realtime: WebSocket/SSE channel pushing inbound `Message` + new `Match` events.
- `GET /listings/me` / `PUT /listings/me` / `POST /listings` (multipart for photos → storage URLs).
- Enable CORS for the frontend origin.

## Things to ADD when productionizing (not in prototype)
1. Auth (login/register + token handling).
2. Real-time chat (WebSocket/SSE) instead of the canned reply.
3. Real photo upload + hosting (placeholders today).
4. URL routing.
5. Proper build tooling (Vite/Next) — drop the CDN React + in-browser Babel.

## Assets
No raster assets. Watch images are **PhotoBox placeholders** (a CSS radial-gradient "dial" silhouette) —
swap for real uploaded photos. Icons are unicode glyphs (♥ ♡ ⇅ ⇄ ◍ ⤓ ✕ ⚑ ◳ ⌚ ✉). Country flags render as
2-letter mono codes (emoji flags don't render on Windows). Fonts via Google Fonts (see Typography).

## Files (in this bundle)
- `proto-data.jsx` — palette `P`, `TIERS`, mock `WATCHES`/`MY_WATCH`/`MATCHES`, primitives
  (`PhotoBox`, `TierBadge`, `Flag`, `AnonToken`). **Source of truth for tokens & data shapes.**
- `proto-shell.jsx` — `Logo`, `Header`, `TabBar`, `PageHead`, `Toast`.
- `proto-browse.jsx` — `WatchCard`, `Browse`, filter `Dropdown`, `WatchDrawer`.
- `proto-other.jsx` — `MyWatch`, `Matches`, `MatchesEmpty`, `Chat`.
- `proto-create.jsx` — `CreateListing` stepper + sub-controls.
- `proto-app.jsx` — top-level `App`, state, navigation, (mock) match + chat logic.
- `RefSwap Prototype.html` — entry point (fonts, global CSS, keyframes, responsive rules, script order).
- `PROMPT.md` — a ready-to-paste prompt for Claude Code.

Open `RefSwap Prototype.html` in a browser to see the exact intended result.
