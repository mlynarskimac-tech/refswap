import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/auth-context'
import { BadgeProvider } from './context/badge-context'
import { ToastProvider } from './context/toast-context'
import { AuthGateProvider } from './context/auth-gate-context'
import { supabase } from './supabase'
import Login from './pages/Login'
import CompleteProfile from './pages/CompleteProfile'
import CreateListing from './pages/CreateListing'
import Browse from './pages/Browse'
import MyWatch from './pages/MyWatch'
import IncomingLikes from './pages/IncomingLikes'
import Matches from './pages/Matches'
import Chat from './pages/Chat'
import Header from './components/Header'
import TabBar from './components/TabBar'
import Toast from './components/Toast'
import AuthGate from './components/AuthGate'

const AUTH_ROUTES = ['/login', '/register']

function isProfileComplete(profile) {
  return !!profile && !!profile.name?.trim() && !!profile.country?.trim()
}

function AppRoutes() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  const fetchProfile = useCallback(() => {
    if (!user) { setProfile(null); setProfileLoading(false); return Promise.resolve() }
    return supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => { setProfile(data); setProfileLoading(false) })
  }, [user])

  useEffect(() => {
    setProfileLoading(true)
    fetchProfile()
  }, [fetchProfile])

  if (loading || profileLoading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', color: 'var(--ink3)', fontSize: 14,
      fontFamily: 'var(--sans)',
    }}>
      Loading…
    </div>
  )

  const profileComplete = isProfileComplete(profile)

  if (user && !profileComplete && !AUTH_ROUTES.includes(location.pathname)) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <CompleteProfile onComplete={fetchProfile} />
        <Toast />
      </div>
    )
  }

  const isAuthRoute = AUTH_ROUTES.includes(location.pathname)
  const showHeader  = !isAuthRoute
  const showTabBar  = !!user && !isAuthRoute

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: showTabBar ? 70 : 0 }}>
      {showHeader && <Header />}
      <Routes>
        <Route path="/"                element={<Browse />} />
        <Route path="/browse"          element={<Navigate to="/" replace />} />
        <Route path="/create-listing"  element={user ? <CreateListing /> : <Navigate to="/login" />} />
        <Route path="/my-watch"        element={user ? <MyWatch />       : <Navigate to="/login" />} />
        <Route path="/incoming"        element={user ? <IncomingLikes /> : <Navigate to="/login" />} />
        <Route path="/matches"         element={user ? <Matches />       : <Navigate to="/login" />} />
        <Route path="/chat/:matchId"   element={user ? <Chat />          : <Navigate to="/login" />} />
        <Route path="/chat"            element={user ? <Chat />          : <Navigate to="/login" />} />
        <Route path="/login"           element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {showTabBar && <TabBar />}
      <AuthGate />
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BadgeProvider>
          <ToastProvider>
            <AuthGateProvider>
              <AppRoutes />
            </AuthGateProvider>
          </ToastProvider>
        </BadgeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
