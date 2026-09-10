import { createContext, useContext, useState, useCallback } from 'react'

const AuthGateCtx = createContext({ isOpen: false, open: () => {}, close: () => {} })

export function AuthGateProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)

  const open  = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  return (
    <AuthGateCtx.Provider value={{ isOpen, open, close }}>
      {children}
    </AuthGateCtx.Provider>
  )
}

export const useAuthGate = () => useContext(AuthGateCtx)
