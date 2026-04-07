import { useState } from 'react'
import { Ico, Tip } from './ui.jsx'
import { NAV_TOOLS, INSERT_TOOLS } from './utils.js'

function SidebarBtn({ active, onClick, onDbl, icon, label, kbd }) {
  const [h, setH] = useState(false)
  return (
    <button
      onClick={onClick}
      onDoubleClick={onDbl}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 7, width: '100%',
        padding: '6px 8px',
        background: active ? '#161616' : h ? '#111' : 'transparent',
        border: `1px solid ${active ? '#202020' : 'transparent'}`,
        borderRadius: 4,
        color: active ? '#ddd' : h ? '#888' : '#444',
        cursor: 'pointer', fontSize: 12, marginBottom: 2,
        transition: 'all 0.1s', textAlign: 'left',
      }}>
      <Ico n={icon} s={13} />
      <span style={{ flex: 1 }}>{label}</span>
      <span style={{ fontSize: 10, color: '#222', fontFamily: 'DM Mono,monospace' }}>{kbd}</span>
    </button>
  )
}

const sectionLabel = {
  fontSize: 9, color: '#2a2a2a', textTransform: 'uppercase',
  letterSpacing: '0.12em', fontFamily: 'DM Mono,monospace',
  fontWeight: 500, marginBottom: 7,
}

export function Sidebar({ tool, setTool, tab, setTab, nodes, selIds, setSelIds, onAddCenter }) {
  const [q, setQ] = useState('')
  const filtered = nodes.filter(n =>
    !q || (n.title + n.type + (n.content || '')).toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div style={{ width: 210, background: '#0b0b0b', borderRight: '1px solid #151515', display: 'flex', flexShrink: 0, overflow: 'hidden' }}>
      {/* Icon strip */}
      <div style={{ width: 40, background: '#090909', borderRight: '1px solid #121212', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8, gap: 2 }}>
        {[
          { id: 'tools',  icon: 'grid',   label: 'Outils'   },
          { id: 'layers', icon: 'layers', label: 'Calques'  },
          { id: 'search', icon: 'search', label: 'Recherche'},
        ].map(t => (
          <Tip key={t.id} label={t.label}>
            <button onClick={() => setTab(t.id)}
              style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: tab === t.id ? '#171717' : 'transparent', border: 'none', color: tab === t.id ? '#888' : '#333', cursor: 'pointer', borderRadius: 5, marginBottom: 2 }}>
              <Ico n={t.icon} s={14} />
            </button>
          </Tip>
        ))}
      </div>

      {/* Panel */}
      <div style={{ flex: 1, overflow: 'auto', padding: 10 }}>

        {/* ── TOOLS ─── */}
        {tab === 'tools' && (
          <>
            <div style={sectionLabel}>Navigation</div>
            {NAV_TOOLS.map(t => (
              <SidebarBtn key={t.id} active={tool === t.id} onClick={() => setTool(t.id)} icon={t.icon} label={t.label} kbd={t.key} />
            ))}
            <div style={{ height: 1, background: '#111', margin: '10px 0' }} />
            <div style={sectionLabel}>Insérer</div>
            {INSERT_TOOLS.map(t => (
              <SidebarBtn key={t.id} active={tool === t.id} onClick={() => setTool(t.id)} onDbl={() => onAddCenter(t.id)} icon={t.icon} label={t.label} kbd={t.key} />
            ))}
            <div style={{ height: 1, background: '#111', margin: '10px 0' }} />
            <div style={sectionLabel}>Ajout rapide</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4 }}>
              {INSERT_TOOLS.filter(t => t.id !== 'connect').map(t => (
                <Tip key={t.id} label={t.label}>
                  <button onClick={() => onAddCenter(t.id)}
                    style={{ aspectRatio: 1, background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', cursor: 'pointer', width: '100%' }}>
                    <Ico n={t.icon} s={13} />
                  </button>
                </Tip>
              ))}
            </div>
          </>
        )}

        {/* ── LAYERS ─── */}
        {tab === 'layers' && (
          <>
            <div style={sectionLabel}>Calques ({nodes.length})</div>
            {nodes.length === 0 && (
              <div style={{ fontSize: 11, color: '#1e1e1e', textAlign: 'center', paddingTop: 20 }}>Aucun élément</div>
            )}
            {[...nodes].reverse().map(n => (
              <div key={n.id} onClick={() => setSelIds([n.id])}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 6px', borderRadius: 4, cursor: 'pointer', background: selIds.includes(n.id) ? '#151515' : 'transparent', color: selIds.includes(n.id) ? '#bbb' : '#444', fontSize: 11, marginBottom: 1, transition: 'all 0.1s' }}>
                <Ico n={INSERT_TOOLS.find(t => t.id === n.type)?.icon || 'type'} s={11} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title || n.type}</span>
                <span style={{ fontSize: 9, color: '#1e1e1e', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase' }}>{n.type}</span>
              </div>
            ))}
          </>
        )}

        {/* ── SEARCH ─── */}
        {tab === 'search' && (
          <>
            <input
              placeholder="Rechercher…" value={q}
              onChange={e => setQ(e.target.value)}
              style={{ width: '100%', background: '#0e0e0e', border: '1px solid #181818', color: '#ccc', fontSize: 12, padding: '5px 8px', borderRadius: 4, outline: 'none', marginBottom: 8 }}
            />
            {filtered.map(n => (
              <div key={n.id} onClick={() => setSelIds([n.id])}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 6px', borderRadius: 4, cursor: 'pointer', color: '#555', fontSize: 11, marginBottom: 1 }}>
                <Ico n={INSERT_TOOLS.find(t => t.id === n.type)?.icon || 'type'} s={11} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {n.title || n.content || n.type}
                </span>
              </div>
            ))}
            {q && filtered.length === 0 && (
              <div style={{ fontSize: 11, color: '#222', textAlign: 'center', paddingTop: 12 }}>Aucun résultat</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
