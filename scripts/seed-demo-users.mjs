// RefSwap — seed demo inventory for a private collector demo.
//
// Creates 12 fictional @example.com collector accounts, each with one active
// listing and a wishlist, using the live watch catalogue as the only source
// of truth for brand/model/reference/price_tier. Data-only: no DDL, no schema
// changes, no likes/matches (matching still requires two mutual likes via the
// existing trigger). Idempotent — re-running updates existing @example.com
// rows in place rather than duplicating them.
//
// Usage (PowerShell, from repo root):
//   node scripts/seed-demo-users.mjs --dry-run   # validate + preview only
//   node scripts/seed-demo-users.mjs             # perform the seed
//
// Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from the environment, or
// falls back to .env.seed.local (gitignored) in the repo root.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..')
const DRY_RUN = process.argv.includes('--dry-run')
const SHARED_PASSWORD = 'RefSwapDemo!2026'
const EXPECTED_PROJECT_REF = 'saanegsexzmgefdkoxaf'

// ── env ──────────────────────────────────────────────────────────────────
function loadEnvFile(filePath) {
  const out = {}
  let raw
  try { raw = readFileSync(filePath, 'utf8') } catch { return out }
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    out[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim()
  }
  return out
}

const fileEnv = loadEnvFile(path.join(REPO_ROOT, '.env.seed.local'))
const SUPABASE_URL = process.env.SUPABASE_URL || fileEnv.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || fileEnv.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (env or .env.seed.local).')
  process.exit(1)
}

// ── seed plan ────────────────────────────────────────────────────────────
// Every `ref` below was checked against the LIVE watch_references table.
// Where the originally-briefed candidate reference didn't exist in the
// catalogue, `candidate` + `substitutionReason` record what was swapped and
// why (never an invented reference — always a real catalogue row).
const ACCOUNTS = [
  {
    email: 'collector01@example.com', name: 'Marek', country: 'PL',
    daysAgo: 14, geo_scope: 'europe', open_to_topup: true,
    ref: '126610LN',
    wishlist: ['126710BLNR', '126500LN', '126334'],
  },
  {
    email: 'collector02@example.com', name: 'Adam', country: 'PL',
    daysAgo: 11, geo_scope: 'local', open_to_topup: true,
    ref: '310.30.42.50.01.002',
    wishlist: ['WSSA0018', '210.30.42.20.01.001'],
  },
  {
    email: 'collector03@example.com', name: 'Lukas', country: 'PL',
    daysAgo: 6, geo_scope: 'global', open_to_topup: false,
    ref: 'WSSA0018',
    wishlist: ['310.30.42.50.01.002', 'WSTA0041', '3858520'],
  },
  {
    email: 'collector04@example.com', name: 'Tomasz', country: 'PL',
    daysAgo: 3, geo_scope: 'europe', open_to_topup: true,
    ref: '126710BLNR',
    wishlist: ['126610LN', '126500LN', '126603'],
  },
  {
    email: 'collector05@example.com', name: 'Piotr', country: 'PL',
    daysAgo: 13, geo_scope: 'global', open_to_topup: true,
    ref: '126500LN',
    candidate: '126500LN', // matched exactly, no substitution needed
    wishlist: ['15510ST.OO.1320ST.04', '126710BLNR', '126610LN', '226659'],
  },
  {
    email: 'collector06@example.com', name: 'Jakub', country: 'PL',
    daysAgo: 9, geo_scope: 'europe', open_to_topup: true,
    ref: '15510ST.OO.1320ST.04',
    candidate: '15510ST.OO.1320ST.06',
    substitutionReason: "Briefed ref '...ST.06' doesn't exist. Nearest real Royal Oak in the same 41mm/'jumbo' 50th-anniversary case family (...ST.04, blue dial) substituted — same desirability tier, same model line.",
    wishlist: ['126500LN', '26470ST.OO.A027CA.01', '4500V/110A-B128'],
  },
  {
    email: 'collector07@example.com', name: 'Florian', country: 'AT',
    daysAgo: 2, geo_scope: 'local', open_to_topup: false,
    ref: 'Q713842J',
    candidate: 'Q397848J',
    substitutionReason: "Briefed ref doesn't exist (looks like a merge of two real refs). Catalogue has two Reverso Tribute variants — Q713842J is the 'small seconds' one the brief actually asked for by name, so that's the correct match, not a downgrade.",
    wishlist: ['IW371604', 'Q1238420'],
  },
  {
    email: 'collector08@example.com', name: 'Martin', country: 'DE',
    daysAgo: 12, geo_scope: 'europe', open_to_topup: true,
    ref: 'IW371604',
    candidate: 'IW371604', // matched exactly
    wishlist: ['Q713842J', 'IW388101', 'M79030N-0001'],
  },
  {
    email: 'collector09@example.com', name: 'Daniel', country: 'DE',
    daysAgo: 5, geo_scope: 'local', open_to_topup: true,
    ref: 'M79030N-0001',
    candidate: 'M79030N-0001', // matched exactly
    wishlist: ['IW371604', 'M25600TN-0001', '124270'],
  },
  {
    email: 'collector10@example.com', name: 'Michael', country: 'DE',
    daysAgo: 8, geo_scope: 'global', open_to_topup: false,
    ref: '126334',
    candidate: '126334', // brief said "exact 126334 variant in catalogue" — matched exactly
    wishlist: ['126610LN', '215.30.44.21.01.001'],
  },
  {
    email: 'collector11@example.com', name: 'Reto', country: 'CH',
    daysAgo: 4, geo_scope: 'global', open_to_topup: true,
    ref: '310.60.42.50.02.001',
    candidate: '310.32.42.50.02.001',
    substitutionReason: "Briefed 'Silver Snoopy Award' ref doesn't exist — that limited edition isn't in the catalogue at all. Substituted the catalogue's other high-tier Speedmaster Moonwatch (Canopus gold / silver dial, ultra tier) to keep an aspirational Omega in the US ultra-tier slot.",
    wishlist: ['4500V/110A-B128', '126500LN', '15202ST.OO.1240ST.01'],
  },
  {
    email: 'collector12@example.com', name: 'Bram', country: 'NL',
    daysAgo: 1, geo_scope: 'europe', open_to_topup: false,
    ref: '4500V/110A-B128',
    candidate: '4500V/110A-B128', // matched exactly
    wishlist: ['310.60.42.50.02.001', '4600E/110A-B442', '336934'],
  },
]

// ── helpers ──────────────────────────────────────────────────────────────
function isoDaysAgo(days) {
  const d = new Date()
  d.setUTCHours(12, 0, 0, 0)
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString()
}

async function main() {
  console.log('='.repeat(72))
  console.log(`TARGET: PRODUCTION Supabase project`)
  console.log(`  URL: ${SUPABASE_URL}`)
  if (!SUPABASE_URL.includes(EXPECTED_PROJECT_REF)) {
    console.log(`  WARNING: URL does not contain expected project ref '${EXPECTED_PROJECT_REF}' — double-check this is the right project.`)
  }
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE (will insert/update data)'}`)
  console.log('  This script performs no DDL, no schema changes, and inserts no likes/matches.')
  console.log('='.repeat(72))

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // ── 1. Load live catalogue ──────────────────────────────────────────────
  const { data: refRows, error: catErr } = await supabase
    .from('watch_references')
    .select('id, reference, variant, price_tier, watch_models(name, watch_brands(name))')
  if (catErr) {
    console.error('Failed to read live watch catalogue:', catErr)
    process.exit(1)
  }
  const catalog = new Map()
  for (const r of refRows) {
    catalog.set(r.reference, {
      id: r.id,
      reference: r.reference,
      variant: r.variant,
      price_tier: r.price_tier,
      model: r.watch_models?.name ?? null,
      brand: r.watch_models?.watch_brands?.name ?? null,
    })
  }
  console.log(`Loaded live catalogue: ${catalog.size} references.\n`)

  // ── 2. Validate every reference used by the plan ────────────────────────
  const missing = []
  function resolve(ref) {
    const hit = catalog.get(ref)
    if (!hit) missing.push(ref)
    return hit
  }
  for (const acc of ACCOUNTS) {
    resolve(acc.ref)
    for (const w of acc.wishlist) resolve(w)
  }
  if (missing.length > 0) {
    console.error('FATAL: the following references are not in the live catalogue:')
    for (const m of [...new Set(missing)]) console.error(`  - ${m}`)
    console.error('Refusing to proceed. Fix the seed plan (never invent a reference).')
    process.exit(1)
  }
  console.log('Catalogue validation: all listing + wishlist references resolved against live data.\n')

  // ── 3. Existing @example.com auth users (for idempotency) ──────────────
  const { data: userList, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 200 })
  if (listErr) { console.error('Failed to list auth users:', listErr); process.exit(1) }
  const existingByEmail = new Map(userList.users.map(u => [u.email, u]))

  // ── 4. Plan / report table ──────────────────────────────────────────────
  console.log('Planned accounts:\n')
  const planRows = ACCOUNTS.map((acc, i) => {
    const listingRef = catalog.get(acc.ref)
    const wishlistResolved = acc.wishlist.map(w => catalog.get(w))
    const exists = existingByEmail.has(acc.email)
    return { i: i + 1, acc, listingRef, wishlistResolved, exists }
  })

  for (const { i, acc, listingRef, wishlistResolved, exists } of planRows) {
    console.log(`#${String(i).padStart(2, '0')} ${acc.email}  [${exists ? 'EXISTS → will update' : 'NEW → will create'}]`)
    console.log(`    name: ${acc.name}   country: ${acc.country}   created_at: ${isoDaysAgo(acc.daysAgo)}`)
    console.log(`    listing: ${listingRef.brand} ${listingRef.model} — ${listingRef.reference} (${listingRef.price_tier})${listingRef.variant ? '  · ' + listingRef.variant : ''}`)
    console.log(`    geo_scope: ${acc.geo_scope}   open_to_topup: ${acc.open_to_topup}   photos: [] (renders as accent-colour placeholder — see notes)`)
    console.log(`    wishlist (${wishlistResolved.length}): ${wishlistResolved.map(w => `${w.brand} ${w.model} ${w.reference}`).join(' | ')}`)
    if (acc.substitutionReason) {
      console.log(`    SUBSTITUTED from briefed candidate '${acc.candidate}': ${acc.substitutionReason}`)
    }
    console.log('')
  }

  const tierCounts = {}
  const brandCounts = {}
  let topupTrue = 0
  for (const { acc, listingRef } of planRows) {
    tierCounts[listingRef.price_tier] = (tierCounts[listingRef.price_tier] || 0) + 1
    brandCounts[listingRef.brand] = (brandCounts[listingRef.brand] || 0) + 1
    if (acc.open_to_topup) topupTrue++
  }
  console.log('Summary: tiers', tierCounts, '| brands', brandCounts, `| top-up ${topupTrue}/12`)
  const countryCounts = {}
  for (const { acc } of planRows) countryCounts[acc.country] = (countryCounts[acc.country] || 0) + 1
  console.log('Countries:', countryCounts)

  if (DRY_RUN) {
    console.log('\nDry run complete. No accounts, profiles, or listings were created or modified.')
    return
  }

  // ── 5. Live run: create/update users, profiles, listings ───────────────
  const credentialLines = [
    'RefSwap seed demo accounts — throwaway @example.com collector accounts.',
    `Shared password: ${SHARED_PASSWORD}`,
    '',
  ]
  const results = []

  for (const { i, acc, listingRef, wishlistResolved } of planRows) {
    const label = `#${String(i).padStart(2, '0')} ${acc.email}`
    try {
      let userId = existingByEmail.get(acc.email)?.id
      let userAction = 'skipped (already existed)'
      if (!userId) {
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
          email: acc.email,
          password: SHARED_PASSWORD,
          email_confirm: true,
        })
        if (createErr) throw new Error(`createUser: ${createErr.message}`)
        userId = created.user.id
        userAction = 'created'
      }

      const createdAt = isoDaysAgo(acc.daysAgo)
      const { error: profileErr } = await supabase
        .from('profiles')
        .upsert({ id: userId, email: acc.email, name: acc.name, country: acc.country, created_at: createdAt }, { onConflict: 'id' })
      if (profileErr) throw new Error(`profile upsert: ${profileErr.message}`)

      const { data: existingListing, error: findListingErr } = await supabase
        .from('listings')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle()
      if (findListingErr) throw new Error(`listing lookup: ${findListingErr.message}`)

      const listingPayload = {
        user_id: userId,
        reference_id: listingRef.id,
        brand: listingRef.brand,
        model: listingRef.model,
        reference: listingRef.reference,
        price_tier: listingRef.price_tier,
        geo_scope: acc.geo_scope,
        open_to_topup: acc.open_to_topup,
        wanted_references: wishlistResolved.map(w => w.reference),
        photos: [],
        is_active: true,
        created_at: createdAt,
      }

      let listingAction
      if (existingListing) {
        const { error: updErr } = await supabase.from('listings').update(listingPayload).eq('id', existingListing.id)
        if (updErr) throw new Error(`listing update: ${updErr.message}`)
        listingAction = 'updated'
      } else {
        const { error: insErr } = await supabase.from('listings').insert(listingPayload)
        if (insErr) throw new Error(`listing insert: ${insErr.message}`)
        listingAction = 'created'
      }

      console.log(`${label}: user ${userAction}, listing ${listingAction}.`)
      results.push({ email: acc.email, ok: true, userAction, listingAction })
      credentialLines.push(acc.email)
    } catch (err) {
      console.error(`${label}: FAILED — ${err.message}`)
      results.push({ email: acc.email, ok: false, error: err.message })
    }
  }

  const credPath = path.join(REPO_ROOT, 'seed-credentials.local.txt')
  writeFileSync(credPath, credentialLines.join('\n') + '\n', 'utf8')

  console.log('\n' + '='.repeat(72))
  console.log('SEED RUN SUMMARY')
  const ok = results.filter(r => r.ok)
  const failed = results.filter(r => !r.ok)
  console.log(`  Succeeded: ${ok.length}/12`)
  if (failed.length) {
    console.log(`  FAILED: ${failed.length}`)
    for (const f of failed) console.log(`    - ${f.email}: ${f.error}`)
  }
  console.log(`  Credentials written to: ${credPath}`)
  console.log('  Shared password (also printed above run): ' + SHARED_PASSWORD)
  console.log('='.repeat(72))
}

main().catch(err => {
  console.error('Unhandled error:', err)
  process.exit(1)
})
