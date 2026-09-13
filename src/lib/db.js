// Logs Supabase query errors with context and returns data (or null on error).
export function unwrap({ data, error }, context) {
  if (error) {
    console.error(`[${context}]`, error)
    return null
  }
  return data
}

// After inserting a like, the mutual-match trigger (handle_mutual_like) commits
// in the same transaction — but PostgREST can lag a beat behind that commit.
// Poll a few times instead of a single fixed sleep: fast path returns
// immediately, slow path still catches up within ~1s.
export async function findFreshMatch(supabase, userId, listingId, { attempts = 4, delayMs = 300 } = {}) {
  for (let i = 0; i < attempts; i++) {
    const { data, error } = await supabase
      .from('matches')
      .select('id')
      .eq('status', 'active')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .or(`listing_a.eq.${listingId},listing_b.eq.${listingId}`)
      .maybeSingle()

    if (error) {
      console.error('[findFreshMatch]', error)
      return null
    }
    if (data) return data
    if (i < attempts - 1) await new Promise(resolve => setTimeout(resolve, delayMs))
  }
  return null
}
