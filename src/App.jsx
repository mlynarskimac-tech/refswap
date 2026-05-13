import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/auth-context'
import { supabase } from './supabase'
import Login from './pages/Login'
import CompleteProfile from './pages/CompleteProfile'

function AppRoutes() {
  const { user, loading } = useAuth()
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
      .then(({ data, error }) => {
  setProfile(data)
  setProfileLoading(false)
})
  }, [user])

  if (loading || profileLoading) return <div>Loading...</div>

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route
        path="/"
        element={
          !user ? <Navigate to="/login" /> :
          !profile ? <CompleteProfile onComplete={() => window.location.reload()} /> :
          <div>Welcome, {profile.name}! 🎉
          <button onClick={() => { supabase.auth.signOut(); window.location.reload(); }}>
            Sign out
          </button>
        </div>
        }
      />
    </Routes>
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