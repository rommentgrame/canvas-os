import { useState } from 'react'
import { ICONS } from './utils.js'

// ── SVG Icon ───────────────────────────────────────────────
export function Ico({ n, s = 16, c = 'currentColor' }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICONS[n] || ''} fill="none" />
    </svg>
  )
}

// ── Tooltip ────────────────────────────────────────────────
export function Tip({ children, label }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}>
      {children}
      {show && label && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 'calc(100% + 6px)',
          transform: 'translateX(-50%)', background: '#111', border: '1px solid #222',
          color: '#aaa', fontSize: 10, padding: '3px 7px', borderRadius: 4,
          whiteSpace: 'nowrap', fontFamily: 'DM Mono,monospace',
          pointerEvents: 'none', zIndex: 9999, letterSpacing: '0.04em',
        }}>
          {label}
        </div>
      )}
    </div>
  )
}

// ── Icon Button ────────────────────────────────────────────
export function IBtn({ icon, label, active, onClick, danger, size = 15, style = {} }) {
  const [h, setH] = useState(false)
  return (
    <Tip label={label}>
      <button onClick={onClick}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 30, height: 30,
          background: active ? '#1e1e1e' : h ? '#141414' : 'transparent',
          border: `1px solid ${active ? '#2a2a2a' : h ? '#1e1e1e' : 'transparent'}`,
          borderRadius: 5,
          color: danger ? (h ? '#ff6666' : '#883333') : active ? '#ddd' : h ? '#999' : '#555',
          cursor: 'pointer', transition: 'all 0.1s', flexShrink: 0, ...style,
        }}>
        <Ico n={icon} s={size} />
      </button>
    </Tip>
  )
}

// ── Notification toast ─────────────────────────────────────
export function Notif({ msg }) {
  if (!msg) return null
  return (
    <div style={{
      position: 'absolute', bottom: 48, left: '50%', transform: 'translateX(-50%)',
      background: '#111', border: '1px solid #1e1e1e', color: '#bbb',
      padding: '6px 14px', borderRadius: 20, fontSize: 11, zIndex: 9999,
      pointerEvents: 'none', fontFamily: 'DM Mono,monospace',
      letterSpacing: '0.03em', whiteSpace: 'nowrap',
      animation: 'fadeUp 0.2s ease',
    }}>
      {msg}
    </div>
  )
}

// ── Prop row (right panel) ─────────────────────────────────
export function Prop({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontSize: 9, color: '#2a2a2a', textTransform: 'uppercase',
        letterSpacing: '0.1em', fontFamily: 'DM Mono,monospace', marginBottom: 5,
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}

export const inputStyle = {
  width: '100%', background: '#0e0e0e', border: '1px solid #171717',
  color: '#888', fontSize: 11, padding: '4px 7px', borderRadius: 3,
  outline: 'none', fontFamily: 'DM Mono,monospace', boxSizing: 'border-box',
}

export const subLabel = {
  fontSize: 9, color: '#222', marginBottom: 2, fontFamily: 'DM Mono,monospace',
}

export const actionBtn = {
  padding: '5px 0', background: '#0f0f0f', border: '1px solid #1a1a1a',
  color: '#555', fontSize: 11, borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit',
}
