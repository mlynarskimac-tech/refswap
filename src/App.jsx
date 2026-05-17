import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/auth-context'
import { supabase } from './supabase'
import Login from './pages/Login'
import CompleteProfile from './pages/CompleteProfile'
import CreateListing from './pages/CreateListing'
import Browse from './pages/Browse'
import MyWatch from './pages/MyWatch'
import Matches from './pages/Matches'
import Chat from './pages/Chat'
import Header from './components/Header'

const AUTH_ROUTES = ['/login', '/register']

function AppRoutes() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setProfileLoading(false)
      return
    }

    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setProfile(data)
        setProfileLoading(false)
      })
  }, [user])

  if (loading || profileLoading) return <div>Loading...</div>

  const showHeader = user && !AUTH_ROUTES.includes(location.pathname)

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/browse" element={<Browse />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/my-watch" element={user ? <MyWatch /> : <Navigate to="/login" />} />
        <Route path="/matches" element={user ? <Matches /> : <Navigate to="/login" />} />
        <Route path="/chat/:matchId" element={user ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route
          path="/"
          element={
            !user ? <Navigate to="/login" /> :
            !profile ? <CompleteProfile onComplete={() => window.location.reload()} /> :
            <div style={{ padding: 24 }}>Welcome, {profile.name}!</div>
          }
        />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}