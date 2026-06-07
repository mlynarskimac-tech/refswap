import { createContext, useContext, useCallback, useState } from 'react'

const ToastCtx = createContext({ flash: () => {} })

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('')

  const flash = useCallback((text) => {
    setMsg(text)
    setTimeout(() => setMsg(''), 2600)
  }, [])

  return (
    <ToastCtx.Provider value={{ flash, msg }}>
      {children}
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
