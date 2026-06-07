import { useToast } from '../context/toast-context'

export default function Toast() {
  const { msg } = useToast()
  if (!msg) return null
  return (
    <div style={{
      position: 'fixed', bottom: 88, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 60,
      background: '#1C1B19', color: '#fff',
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 13, padding: '11px 18px',
      borderRadius: 999,
      boxShadow: '0 10px 30px -10px rgba(0,0,0,.45)',
      animation: 'toastIn .25s ease',
      whiteSpace: 'nowrap',
    }}>
      {msg}
    </div>
  )
}
