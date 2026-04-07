import { useState } from 'react'
import { Ico, IBtn, Tip, Prop, inputStyle, subLabel, actionBtn } from './ui.jsx'
import { INSERT_TOOLS } from './utils.js'

// ── Right Properties Panel ─────────────────────────────────
export function RightPanel({ node, onUpdate, onDel, onDup, onClose }) {
  if (!node) return null
  return (
    <div style={{
      width: 200, background: '#0b0b0b', borderLeft: '1px solid #151515',
      display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid #131313' }}>
        <span style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'DM Mono,monospace', flex: 1 }}>
          {node.type}
        </span>
        <div style={{ display: 'flex', gap: 2 }}>
          <IBtn icon="copy"  size={13} onClick={onDup}   label="Dupliquer" />
          <IBtn icon="trash" size={13} onClick={onDel}   label="Supprimer" danger />
          <IBtn icon="x"     size={13} onClick={onClose} label="Fermer" />
        </div>
      </div>

      <div style={{ padding: 12, overflow: 'auto', flex: 1 }}>
        <Prop label="Titre">
          <input defaultValue={node.title} style={inputStyle}
            onBlur={e => onUpdate(node.id, { title: e.target.value })} />
        </Prop>

        <Prop label="Position">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
            <div><div style={subLabel}>X</div><input value={Math.round(node.x)} readOnly style={inputStyle} /></div>
            <div><div style={subLabel}>Y</div><input value={Math.round(node.y)} readOnly style={inputStyle} /></div>
          </div>
        </Prop>

        <Prop label="Taille">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
            <div><div style={subLabel}>L</div><input value={Math.round(node.w)} readOnly style={inputStyle} /></div>
            <div><div style={subLabel}>H</div><input value={Math.round(node.h)} readOnly style={inputStyle} /></div>
          </div>
        </Prop>

        {node.type === 'text' && (
          <Prop label="Taille police">
            <input type="range" min="10" max="32" value={node.fontSize || 14}
              onChange={e => onUpdate(node.id, { fontSize: +e.target.value })}
              style={{ width: '100%', accentColor: '#444' }} />
            <span style={{ fontSize: 10, color: '#444', fontFamily: 'DM Mono,monospace' }}>
              {node.fontSize || 14}px
            </span>
          </Prop>
        )}

        {node.type === 'shape' && (
          <Prop label="Forme">
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {['circle', 'rect', 'diamond', 'triangle', 'star'].map(s => (
                <button key={s} onClick={() => onUpdate(node.id, { shape: s })}
                  style={{ padding: '3px 7px', background: node.shape === s ? '#1a1a1a' : '#0f0f0f', border: `1px solid ${node.shape === s ? '#2a2a2a' : '#1a1a1a'}`, color: node.shape === s ? '#aaa' : '#444', fontSize: 10, borderRadius: 3, cursor: 'pointer', fontFamily: 'DM Mono,monospace' }}>
                  {s}
                </button>
              ))}
            </div>
          </Prop>
        )}

        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <button onClick={onDup} style={actionBtn}>Dupliquer</button>
          <button onClick={onDel} style={{ ...actionBtn, borderColor: '#1e1010', color: '#663333' }}>Supprimer</button>
        </div>
      </div>
    </div>
  )
}

// ── Context Menu ───────────────────────────────────────────
function CtxItem({ icon, label, onClick, danger }) {
  const [h, setH] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', background: h ? '#151515' : 'transparent', border: 'none', color: danger ? (h ? '#ff5555' : '#662222') : (h ? '#999' : '#555'), fontSize: 11, cursor: 'pointer', borderRadius: 4, width: '100%', textAlign: 'left', fontFamily: 'inherit' }}>
      <Ico n={icon} s={12} /><span>{label}</span>
    </button>
  )
}

export function ContextMenu({ x, y, onClose, onAdd, onFit, onClear }) {
  return (
    <div onClick={e => e.stopPropagation()}
      style={{ position: 'absolute', left: x, top: y, background: '#0e0e0e', border: '1px solid #1e1e1e', borderRadius: 8, padding: 5, zIndex: 9000, minWidth: 170, boxShadow: '0 8px 32px rgba(0,0,0,0.8)' }}>
      <div style={{ fontSize: 9, color: '#2a2a2a', padding: '3px 10px 5px', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'DM Mono,monospace' }}>
        Ajouter
      </div>
      {INSERT_TOOLS.filter(t => t.id !== 'connect').map(t => (
        <CtxItem key={t.id} icon={t.icon} label={t.label} onClick={() => { onAdd(t.id); onClose() }} />
      ))}
      <div style={{ height: 1, background: '#141414', margin: '4px 0' }} />
      <CtxItem icon="maximize" label="Réinitialiser la vue"     onClick={() => { onFit(); onClose() }} />
      <CtxItem icon="trash"    label="Vider le canvas" danger   onClick={() => { onClear(); onClose() }} />
    </div>
  )
}

// ── Zoom controls ──────────────────────────────────────────
const zbtn = {
  background: 'transparent', border: 'none', color: '#3a3a3a',
  cursor: 'pointer', padding: '3px 5px', display: 'flex', alignItems: 'center', borderRadius: 3,
}

export function ZoomBar({ vp, setVp }) {
  return (
    <div style={{ position: 'absolute', bottom: 14, right: 14, display: 'flex', alignItems: 'center', gap: 4, background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 7, padding: '4px 6px', boxShadow: '0 4px 20px rgba(0,0,0,0.6)', zIndex: 100 }}>
      <button style={zbtn} onClick={() => setVp(v => ({ ...v, z: Math.max(0.1, v.z - 0.1) }))}><Ico n="zoomOut" s={13} /></button>
      <span style={{ fontSize: 10, color: '#333', fontFamily: 'DM Mono,monospace', minWidth: 36, textAlign: 'center' }}>
        {Math.round(vp.z * 100)}%
      </span>
      <button style={zbtn} onClick={() => setVp(v => ({ ...v, z: Math.min(4, v.z + 0.1) }))}><Ico n="zoomIn" s={13} /></button>
      <div style={{ width: 1, height: 14, background: '#1a1a1a', margin: '0 2px' }} />
      <button style={zbtn} onClick={() => setVp({ x: 0, y: 0, z: 1 })}><Ico n="maximize" s={13} /></button>
    </div>
  )
}

// ── Bottom Pages Bar ───────────────────────────────────────
export function BottomBar({ pages, activeId, editId, setActiveId, onAdd, onDel, onDup, onRenameStart, onRenameDone, nodeCount, connCount, vp }) {
  const [pMenu, setPMenu] = useState(null)
  return (
    <div style={{ height: 34, background: '#090909', borderTop: '1px solid #131313', display: 'flex', alignItems: 'center', flexShrink: 0, position: 'relative', zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, overflow: 'auto', padding: '0 8px', gap: 2 }}>
        {pages.map(p => (
          <div key={p.id}
            onClick={() => setActiveId(p.id)}
            onContextMenu={e => { e.preventDefault(); setPMenu({ x: e.clientX, y: e.clientY - 120, id: p.id }) }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px', height: 24, background: activeId === p.id ? '#131313' : 'transparent', border: `1px solid ${activeId === p.id ? '#1e1e1e' : 'transparent'}`, borderRadius: 4, color: activeId === p.id ? '#bbb' : '#383838', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.1s' }}>
            {editId === p.id ? (
              <input autoFocus defaultValue={p.name}
                onClick={e => e.stopPropagation()}
                style={{ background: 'transparent', border: 'none', color: '#ddd', fontSize: 11, outline: 'none', width: 80, fontFamily: 'inherit' }}
                onBlur={e => onRenameDone(p.id, e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') onRenameDone(p.id, e.target.value)
                  if (e.key === 'Escape') onRenameDone(p.id, p.name)
                }}
              />
            ) : (
              <span onDoubleClick={e => { e.stopPropagation(); onRenameStart(p.id) }}>{p.name}</span>
            )}
            {activeId === p.id && pages.length > 1 && (
              <span onClick={e => { e.stopPropagation(); onDel(p.id) }}
                style={{ color: '#333', cursor: 'pointer', fontSize: 13, lineHeight: 1, paddingLeft: 2 }}>×</span>
            )}
          </div>
        ))}
        <button onClick={onAdd}
          style={{ width: 24, height: 24, background: 'transparent', border: '1px solid #1a1a1a', borderRadius: 4, color: '#2a2a2a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 2, flexShrink: 0 }}>
          <Ico n="plus" s={12} />
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px', fontSize: 10, color: '#1e1e1e', fontFamily: 'DM Mono,monospace', borderLeft: '1px solid #121212', height: '100%', flexShrink: 0 }}>
        <span>{nodeCount} él.</span>
        <span style={{ color: '#0f0f0f' }}>·</span>
        <span>{connCount} conn.</span>
        <span style={{ color: '#0f0f0f' }}>·</span>
        <span>{Math.round(vp.z * 100)}%</span>
      </div>

      {/* Page context menu */}
      {pMenu && (
        <div style={{ position: 'fixed', left: pMenu.x, top: pMenu.y, background: '#0e0e0e', border: '1px solid #1e1e1e', borderRadius: 6, padding: 4, zIndex: 9999, minWidth: 140, boxShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
          {[
            { l: 'Renommer',  a: () => { onRenameStart(pMenu.id); setPMenu(null) } },
            { l: 'Dupliquer', a: () => { onDup(pMenu.id);         setPMenu(null) } },
            { l: 'Supprimer', a: () => { onDel(pMenu.id);         setPMenu(null) }, d: true },
          ].map(it => (
            <button key={it.l} onClick={it.a}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 10px', background: 'transparent', border: 'none', color: it.d ? '#773333' : '#777', fontSize: 11, cursor: 'pointer', borderRadius: 3, fontFamily: 'inherit' }}>
              {it.l}
            </button>
          ))}
          <div style={{ position: 'fixed', inset: 0, zIndex: -1 }} onClick={() => setPMenu(null)} />
        </div>
      )}
    </div>
  )
}

// ── Empty canvas placeholder ───────────────────────────────
export function EmptyState() {
  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none', userSelect: 'none' }}>
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ opacity: 0.06, marginBottom: 16 }}>
        <rect x="4" y="4" width="28" height="28" stroke="white" strokeWidth="1.5" rx="2" />
        <rect x="40" y="4" width="28" height="28" stroke="white" strokeWidth="1.5" rx="2" opacity=".5" />
        <rect x="4" y="40" width="28" height="28" stroke="white" strokeWidth="1.5" rx="2" opacity=".5" />
        <rect x="40" y="40" width="28" height="28" stroke="white" strokeWidth="1.5" rx="2" />
        <line x1="32" y1="18" x2="40" y2="18" stroke="white" strokeWidth="1" />
        <line x1="18" y1="32" x2="18" y2="40" stroke="white" strokeWidth="1" />
        <line x1="54" y1="32" x2="54" y2="40" stroke="white" strokeWidth="1" />
        <line x1="32" y1="54" x2="40" y2="54" stroke="white" strokeWidth="1" />
      </svg>
      <div style={{ fontSize: 15, color: '#1e1e1e', fontWeight: 500, marginBottom: 6 }}>Canvas vide</div>
      <div style={{ fontSize: 11, color: '#161616', lineHeight: 1.7 }}>
        Clic droit pour ajouter des éléments<br />ou choisissez un outil dans la barre latérale
      </div>
    </div>
  )
}
