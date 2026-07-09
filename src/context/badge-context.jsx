import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabase'
import { useAuth } from './auth-context'
import { unwrap } from '../lib/db'

const BadgeCtx = createContext({ newMatches: 0, unread: 0, firstUnreadMatchId: null, refresh: () => {} })

export function BadgeProvider({ children }) {
  const { user } = useAuth()
  const [newMatches, setNewMatches] = useState(0)
  const [unread, setUnread] = useState(0)
  const [firstUnreadMatchId, setFirstUnreadMatchId] = useState(null)

  const refresh = useCallback(async () => {
    if (!user) {
      setNewMatches(0); setUnread(0); setFirstUnreadMatchId(null)
      return
    }
    const matches = unwrap(
      await supabase
        .from('matches')
        .select('id, created_at')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .eq('status', 'active'),
      'Badges: fetch matches'
    )

    if (!matches || matches.length === 0) {
      setNewMatches(0); setUnread(0); setFirstUnreadMatchId(null)
      return
    }

    const profile = unwrap(
      await supabase
        .from('profiles')
        .select('last_seen_matches_at')
        .eq('id', user.id)
        .maybeSingle(),
      'Badges: fetch last seen matches'
    )
    const lastSeenMatchesAt = profile?.last_seen_matches_at || null

    const newMatchCount = lastSeenMatchesAt
      ? matches.filter(m => m.created_at > lastSeenMatchesAt).length
      : matches.length
    setNewMatches(newMatchCount)

    const reads = unwrap(
      await supabase
        .from('match_reads')
        .select('match_id, last_read_at')
        .eq('user_id', user.id),
      'Badges: fetch match reads'
    )
    const lastReadMap = Object.fromEntries((reads || []).map(r => [r.match_id, r.last_read_at]))

    const matchIds = matches.map(m => m.id)
    const msgs = unwrap(
      await supabase
        .from('messages')
        .select('match_id, sender_id, created_at')
        .in('match_id', matchIds)
        .neq('sender_id', user.id)
        .eq('is_system', false),
      'Badges: fetch unread messages'
    )

    const unreadMsgs = (msgs || []).filter(msg => {
      const lastReadAt = lastReadMap[msg.match_id]
      return lastReadAt ? msg.created_at > lastReadAt : true
    })
    setUnread(unreadMsgs.length)
    setFirstUnreadMatchId(unreadMsgs.length > 0 ? unreadMsgs[0].match_id : (matches[0]?.id ?? null))
  }, [user])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 30000)
    return () => clearInterval(id)
  }, [refresh])

  return (
    <BadgeCtx.Provider value={{ newMatches, unread, firstUnreadMatchId, refresh }}>
      {children}
    </BadgeCtx.Provider>
  )
}

export const useBadges = () => useContext(BadgeCtx)
