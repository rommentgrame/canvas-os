import { useState } from 'react'
import { Ico, Tip } from './ui.jsx'
import { NODE_COLORS, INSERT_TOOLS } from './utils.js'
import { TextNode, NoteNode, ImageNode, ShapeNode, TableNode, LinkNode, MindNode } from './NodeContent.jsx'

const nodeActionBtn = {
  background: 'transparent', border: 'none', color: '#383838',
  cursor: 'pointer', padding: '2px 3px', display: 'flex', alignItems: 'center', borderRadius: 3,
}

export function CanvasNode({ n, sel, tool, connFrom, onSel, onDrag, onResize, onUpdate, onDel, onDup, onConnStart, onConnEnd }) {
  const [editing, setEditing] = useState(false)
  const [hov, setHov] = useState(false)

  const col = NODE_COLORS[n.type] || NODE_COLORS.text
  const icn = INSERT_TOOLS.find(t => t.id === n.type)?.icon || 'type'

  // ── Mouse drag ─────────────────────────────────────────
  const handleMouseDown = e => {
    if (editing) return
    const tag = e.target.tagName
    if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'BUTTON') return
    e.stopPropagation()

    if (tool === 'connect') {
      connFrom ? onConnEnd(n.id) : onConnStart(n.id)
      return
    }
    onSel(e)
    if (tool !== 'select') return

    let lx = e.clientX, ly = e.clientY
    const move = e2 => { onDrag(n.id, e2.clientX - lx, e2.clientY - ly); lx = e2.clientX; ly = e2.clientY }
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  // ── Resize ─────────────────────────────────────────────
  const handleResizeDown = e => {
    e.stopPropagation(); e.preventDefault()
    let lx = e.clientX, ly = e.clientY
    const move = e2 => { onResize(n.id, e2.clientX - lx, e2.clientY - ly); lx = e2.clientX; ly = e2.clientY }
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={() => { if (tool === 'select' && !connFrom) setEditing(true) }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'absolute', left: n.x, top: n.y, width: n.w, height: n.h,
        background: col.bg,
        border: `1px solid ${sel ? 'rgba(255,255,255,0.25)' : col.border}`,
        borderRadius: 7,
        display: 'flex', flexDirection: 'column',
        boxShadow: sel
          ? '0 0 0 1.5px rgba(255,255,255,0.12), 0 8px 32px rgba(0,0,0,0.7)'
          : hov ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        overflow: 'hidden',
        cursor: tool === 'connect' ? 'crosshair' : 'default',
        zIndex: n.zIndex || 1,
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '5px 9px',
        borderBottom: `1px solid ${col.border}`,
        background: 'rgba(0,0,0,0.15)',
        flexShrink: 0, minHeight: 28,
      }}>
        <span style={{ color: col.acc, opacity: 0.7, display: 'flex', flexShrink: 0 }}>
          <Ico n={icn} s={10} />
        </span>
        <span style={{
          fontSize: 10, color: '#3a3a3a', fontFamily: 'DM Mono,monospace',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {n.title || n.type}
        </span>
        {(sel || hov) && (
          <div style={{ display: 'flex', gap: 1, flexShrink: 0 }} onMouseDown={e => e.stopPropagation()}>
            <Tip label="Connecter">
              <button onClick={() => onConnStart(n.id)} style={nodeActionBtn}><Ico n="connect" s={10} /></button>
            </Tip>
            <Tip label="Dupliquer">
              <button onClick={onDup} style={nodeActionBtn}><Ico n="copy" s={10} /></button>
            </Tip>
            <Tip label="Supprimer">
              <button onClick={onDel} style={{ ...nodeActionBtn, color: '#663333' }}><Ico n="trash" s={10} /></button>
            </Tip>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {n.type === 'text'    && <TextNode    n={n} editing={editing} setEditing={setEditing} onUpdate={onUpdate} />}
        {n.type === 'note'    && <NoteNode    n={n} editing={editing} setEditing={setEditing} onUpdate={onUpdate} />}
        {n.type === 'image'   && <ImageNode   n={n} onUpdate={onUpdate} />}
        {n.type === 'shape'   && <ShapeNode   n={n} onUpdate={onUpdate} col={col} />}
        {n.type === 'table'   && <TableNode   n={n} onUpdate={onUpdate} />}
        {n.type === 'link'    && <LinkNode    n={n} onUpdate={onUpdate} />}
        {n.type === 'mindmap' && <MindNode    n={n} editing={editing} setEditing={setEditing} onUpdate={onUpdate} col={col} />}
      </div>

      {/* Connection ports */}
      {(sel || hov || connFrom) && [
        { s: 'r', st: { right: -5,  top: '50%', transform: 'translateY(-50%)' } },
        { s: 'l', st: { left:  -5,  top: '50%', transform: 'translateY(-50%)' } },
        { s: 't', st: { top:   -5,  left: '50%', transform: 'translateX(-50%)' } },
        { s: 'b', st: { bottom: -5, left: '50%', transform: 'translateX(-50%)' } },
      ].map(({ s, st }) => (
        <div key={s}
          onMouseDown={e => { e.stopPropagation(); onConnStart(n.id) }}
          style={{
            position: 'absolute', ...st,
            width: 10, height: 10, borderRadius: '50%',
            background: connFrom === n.id ? '#fff' : '#1e1e1e',
            border: `1.5px solid ${connFrom === n.id ? '#fff' : '#333'}`,
            cursor: 'crosshair', zIndex: 20, transition: 'background 0.1s',
          }}
        />
      ))}

      {/* Resize handle */}
      {sel && (
        <div onMouseDown={handleResizeDown}
          style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, cursor: 'nwse-resize', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 3, zIndex: 10 }}>
          <svg width="7" height="7" viewBox="0 0 7 7">
            <line x1="0" y1="7" x2="7" y2="0" stroke="#2a2a2a" strokeWidth="1.5" />
            <line x1="3" y1="7" x2="7" y2="3" stroke="#2a2a2a" strokeWidth="1.5" />
          </svg>
        </div>
      )}
    </div>
  )
}
