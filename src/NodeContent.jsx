import { useState } from 'react'
import { Ico } from './ui.jsx'

// ── Text node ──────────────────────────────────────────────
export function TextNode({ n, editing, setEditing, onUpdate }) {
  return editing ? (
    <textarea
      autoFocus
      defaultValue={n.content}
      style={{
        width: '100%', height: '100%', background: 'transparent', border: 'none',
        color: '#d0d0d0', fontSize: n.fontSize || 14, lineHeight: 1.65,
        resize: 'none', outline: 'none', padding: 10,
        fontFamily: 'DM Sans,system-ui,sans-serif',
      }}
      onBlur={e => { onUpdate(n.id, { content: e.target.value }); setEditing(false) }}
      onKeyDown={e => {
        if (e.key === 'Escape') { onUpdate(n.id, { content: e.target.value }); setEditing(false) }
      }}
    />
  ) : (
    <div style={{
      padding: 10,
      color: n.content && n.content !== 'Double-cliquez pour éditer…' ? '#c8c8c8' : '#2a2a2a',
      fontSize: n.fontSize || 14, lineHeight: 1.65,
      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      height: '100%', overflow: 'hidden',
    }}>
      {n.content || 'Double-cliquez pour éditer…'}
    </div>
  )
}

// ── Note node ──────────────────────────────────────────────
export function NoteNode({ n, editing, setEditing, onUpdate }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '4px 10px 2px', fontSize: 9, color: '#3a3a2a', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Note</div>
      {editing ? (
        <textarea
          autoFocus defaultValue={n.content}
          style={{ flex: 1, background: 'transparent', border: 'none', color: '#b0a870', fontSize: 12, lineHeight: 1.7, resize: 'none', outline: 'none', padding: '4px 10px', fontFamily: 'inherit' }}
          onBlur={e => { onUpdate(n.id, { content: e.target.value }); setEditing(false) }}
        />
      ) : (
        <div style={{ flex: 1, padding: '4px 10px', color: n.content ? '#908870' : '#252520', fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap', overflow: 'hidden' }}>
          {n.content || 'Double-cliquez pour écrire…'}
        </div>
      )}
    </div>
  )
}

// ── Image node ─────────────────────────────────────────────
export function ImageNode({ n, onUpdate }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 12, gap: 8 }}>
      {n.url ? (
        <img src={n.url} alt="" style={{ maxWidth: '100%', maxHeight: 'calc(100% - 8px)', objectFit: 'contain', borderRadius: 4 }}
          onError={e => { e.target.style.display = 'none' }} />
      ) : (
        <>
          <div style={{ color: '#1e2e2a' }}><Ico n="image" s={32} /></div>
          <div style={{ fontSize: 11, color: '#333', textAlign: 'center' }}>Coller une URL d'image</div>
          <input
            placeholder="https://…"
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', background: '#080808', border: '1px solid #1a1a1a', color: '#888', padding: '4px 8px', borderRadius: 3, fontSize: 11, outline: 'none' }}
            onKeyDown={e => { if (e.key === 'Enter') onUpdate(n.id, { url: e.target.value }) }}
          />
        </>
      )}
    </div>
  )
}

// ── Shape node ─────────────────────────────────────────────
export function ShapeNode({ n, onUpdate, col }) {
  const shapes = {
    circle:   <ellipse cx="50%" cy="50%" rx="44%" ry="44%" fill="none" stroke={col.acc} strokeWidth="1.5" opacity="0.35" />,
    rect:     <rect x="8%" y="8%" width="84%" height="84%" fill="none" stroke={col.acc} strokeWidth="1.5" opacity="0.35" rx="4" />,
    diamond:  <polygon points="50,8 92,50 50,92 8,50" fill="none" stroke={col.acc} strokeWidth="1.5" opacity="0.35" />,
    triangle: <polygon points="50,8 92,92 8,92" fill="none" stroke={col.acc} strokeWidth="1.5" opacity="0.35" />,
    star:     <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="none" stroke={col.acc} strokeWidth="1.5" opacity="0.35" />,
  }
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {shapes[n.shape || 'circle']}
      </svg>
      <div onMouseDown={e => e.stopPropagation()}
        style={{ position: 'absolute', bottom: 6, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4 }}>
        {Object.keys(shapes).map(s => (
          <button key={s} onClick={() => onUpdate(n.id, { shape: s })}
            style={{ width: 18, height: 18, borderRadius: 2, background: n.shape === s ? '#222' : '#111', border: `1px solid ${n.shape === s ? '#333' : '#1a1a1a'}`, color: '#444', cursor: 'pointer', fontSize: 8, fontFamily: 'DM Mono,monospace' }}>
            {s[0].toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Table node ─────────────────────────────────────────────
export function TableNode({ n, onUpdate }) {
  const rows = n.rows || [['A', 'B'], ['1', '2']]
  return (
    <div style={{ height: '100%', overflow: 'auto', padding: 4 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid #141420' }}>
              {r.map((c, ci) => (
                <td key={ci} style={{
                  padding: '3px 7px',
                  color: ri === 0 ? '#7070d0' : '#9090c0',
                  fontWeight: ri === 0 ? 500 : 400,
                  background: ri === 0 ? 'rgba(80,80,180,0.06)' : 'transparent',
                  fontFamily: ri === 0 ? 'DM Mono,monospace' : 'inherit',
                  fontSize: ri === 0 ? 10 : 11,
                }}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div onMouseDown={e => e.stopPropagation()}>
        <button
          onClick={() => onUpdate(n.id, { rows: [...rows, rows[0].map(() => '')] })}
          style={{ marginTop: 4, fontSize: 10, color: '#333', background: 'transparent', border: '1px dashed #1a1a2a', borderRadius: 3, padding: '2px 8px', cursor: 'pointer', width: '100%' }}>
          + ligne
        </button>
      </div>
    </div>
  )
}

// ── Link node ──────────────────────────────────────────────
export function LinkNode({ n, onUpdate }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 10, gap: 6 }}>
      <div style={{ color: '#2a1a3a' }}><Ico n="link" s={20} /></div>
      <div style={{ fontSize: 11, color: '#555', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
        {n.url || 'Ajouter une URL'}
      </div>
      <input
        placeholder="https://…" defaultValue={n.url}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', background: '#080808', border: '1px solid #1a1a1a', color: '#888', padding: '3px 7px', borderRadius: 3, fontSize: 11, outline: 'none' }}
        onKeyDown={e => { if (e.key === 'Enter') onUpdate(n.id, { url: e.target.value }) }}
      />
    </div>
  )
}

// ── Mind map node ──────────────────────────────────────────
export function MindNode({ n, editing, setEditing, onUpdate, col }) {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
      {editing ? (
        <input
          autoFocus defaultValue={n.content}
          style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${col.acc}`, color: '#ddd', fontSize: 13, fontWeight: 500, outline: 'none', textAlign: 'center', fontFamily: 'inherit' }}
          onBlur={e => { onUpdate(n.id, { content: e.target.value }); setEditing(false) }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === 'Escape') {
              onUpdate(n.id, { content: e.target.value }); setEditing(false)
            }
          }}
        />
      ) : (
        <div style={{ fontSize: 13, fontWeight: 500, color: '#ccc', textAlign: 'center', lineHeight: 1.4, borderBottom: `1px solid ${col.acc}3a`, paddingBottom: 4, width: '100%' }}>
          {n.content || 'Idée'}
        </div>
      )}
    </div>
  )
}
