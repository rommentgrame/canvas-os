import { useState, useRef, useEffect, useCallback } from 'react'
import { TopBar }      from './TopBar.jsx'
import { Sidebar }     from './Sidebar.jsx'
import { CanvasNode }  from './CanvasNode.jsx'
import { Connections } from './Connections.jsx'
import { RightPanel, ContextMenu, ZoomBar, BottomBar, EmptyState } from './Panels.jsx'
import { Notif }       from './ui.jsx'
import {
  uid, pid,
  NODE_TYPES, INSERT_TOOLS,
  createNode, createPage,
  loadFromStorage, saveToStorage,
} from './utils.js'

// ── Canvas grid background ──────────────────────────────────
function CanvasGrid({ vp }) {
  const gs = 28 * vp.z
  const ox = vp.x % gs, oy = vp.y % gs
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <defs>
        <pattern id="sg" x={ox} y={oy} width={gs} height={gs} patternUnits="userSpaceOnUse">
          <path d={`M ${gs} 0 L 0 0 0 ${gs}`} fill="none" stroke="#0f0f0f" strokeWidth="1" />
        </pattern>
        <pattern id="lg" x={ox} y={oy} width={gs * 5} height={gs * 5} patternUnits="userSpaceOnUse">
          <rect width={gs * 5} height={gs * 5} fill="url(#sg)" />
          <path d={`M ${gs * 5} 0 L 0 0 0 ${gs * 5}`} fill="none" stroke="#141414" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#lg)" />
    </svg>
  )
}

// ── App ─────────────────────────────────────────────────────
export default function App() {
  const [proj,     setProj    ] = useState('Untitled Project')
  const [pages,    setPages   ] = useState([createPage('Main Canvas')])
  const [activeId, setActiveId] = useState(null)
  const [editId,   setEditId  ] = useState(null)
  const [tool,     setTool    ] = useState('select')
  const [tab,      setTab     ] = useState('tools')
  const [selIds,   setSelIds  ] = useState([])
  const [connFrom, setConnFrom] = useState(null)
  const [vp,       setVp      ] = useState({ x: 0, y: 0, z: 1 })
  const [ctx,      setCtx     ] = useState(null)
  const [notif,    setNotif   ] = useState(null)
  const [saved,    setSaved   ] = useState(true)

  const canvasRef = useRef(null)
  const panRef    = useRef(null)

  // ── Notification helper ──────────────────────────────────
  const notify = useCallback(msg => {
    setNotif(msg)
    setTimeout(() => setNotif(null), 1800)
  }, [])

  // ── Load from localStorage ───────────────────────────────
  useEffect(() => {
    const data = loadFromStorage()
    if (data?.pages?.length) {
      setProj(data.proj || 'Untitled')
      setPages(data.pages)
      setActiveId(data.pages[0].id)
    } else {
      setActiveId(pages[0].id)
    }
  }, []) // eslint-disable-line

  // ── Auto-save ────────────────────────────────────────────
  useEffect(() => {
    setSaved(false)
    const t = setTimeout(() => {
      saveToStorage({ proj, pages })
      setSaved(true)
    }, 1500)
    return () => clearTimeout(t)
  }, [proj, pages])

  // ── Derived state ────────────────────────────────────────
  const activePage = pages.find(p => p.id === activeId) || pages[0]
  const nodes      = activePage?.nodes       || []
  const conns      = activePage?.connections || []

  // ── Page/node updaters ───────────────────────────────────
  const upPage  = (id, fn) => setPages(prev => prev.map(p => p.id === id ? { ...p, ...fn(p) } : p))
  const setNodes = fn => upPage(activeId, p => ({ nodes:       typeof fn === 'function' ? fn(p.nodes)       : fn }))
  const setConns = fn => upPage(activeId, p => ({ connections: typeof fn === 'function' ? fn(p.connections) : fn }))

  // ── Wheel zoom ───────────────────────────────────────────
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const handler = e => {
      e.preventDefault()
      const d = e.deltaY > 0 ? 0.9 : 1.1
      setVp(v => {
        const nz = Math.min(Math.max(v.z * d, 0.08), 5)
        const r  = el.getBoundingClientRect()
        const mx = e.clientX - r.left, my = e.clientY - r.top
        return { z: nz, x: mx - (mx - v.x) * (nz / v.z), y: my - (my - v.y) * (nz / v.z) }
      })
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  // ── Canvas mouse down ────────────────────────────────────
  const handleCanvasMD = e => {
    // Middle click or hand tool → pan
    if (e.button === 1 || tool === 'hand') {
      panRef.current = { sx: e.clientX - vp.x, sy: e.clientY - vp.y }
      const move = e2 => {
        if (panRef.current) setVp(v => ({ ...v, x: e2.clientX - panRef.current.sx, y: e2.clientY - panRef.current.sy }))
      }
      const up = () => { panRef.current = null; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
      window.addEventListener('mousemove', move)
      window.addEventListener('mouseup', up)
      return
    }
    // Only act on bare canvas
    if (!e.target.classList.contains('cv-bg')) return
    if (connFrom) { setConnFrom(null); return }
    if (tool === 'select') { setSelIds([]); return }

    // Place new node
    if (NODE_TYPES[tool]) {
      const r  = canvasRef.current.getBoundingClientRect()
      const x  = (e.clientX - r.left - vp.x) / vp.z - NODE_TYPES[tool].w / 2
      const y  = (e.clientY - r.top  - vp.y) / vp.z - NODE_TYPES[tool].h / 2
      const nd = createNode(tool, x, y)
      setNodes(prev => [...prev, nd])
      setSelIds([nd.id])
      setTool('select')
    }
  }

  const handleCtxMenu = e => {
    e.preventDefault()
    const r = canvasRef.current?.getBoundingClientRect()
    setCtx({ x: e.clientX - (r?.left || 0), y: e.clientY - (r?.top || 0), px: e.clientX, py: e.clientY })
  }

  // ── Node operations ──────────────────────────────────────
  const dragNode  = (id, dx, dy) => setNodes(prev => prev.map(n => n.id === id ? { ...n, x: n.x + dx / vp.z, y: n.y + dy / vp.z } : n))
  const resNode   = (id, dw, dh) => setNodes(prev => prev.map(n => n.id === id ? { ...n, w: Math.max(100, n.w + dw / vp.z), h: Math.max(60, n.h + dh / vp.z) } : n))
  const updNode   = (id, u)      => setNodes(prev => prev.map(n => n.id === id ? { ...n, ...u } : n))
  const delNode   = id           => { setNodes(prev => prev.filter(n => n.id !== id)); setConns(prev => prev.filter(c => c.from !== id && c.to !== id)); setSelIds(prev => prev.filter(i => i !== id)) }
  const dupNode   = id           => { const n = nodes.find(x => x.id === id); if (n) { const nn = { ...n, id: uid(), x: n.x + 24, y: n.y + 24 }; setNodes(prev => [...prev, nn]); setSelIds([nn.id]) } }

  // ── Connections ──────────────────────────────────────────
  const connStart = id => setConnFrom(prev => prev ? null : id)
  const connEnd   = id => {
    if (connFrom && connFrom !== id && !conns.some(c => c.from === connFrom && c.to === id)) {
      setConns(prev => [...prev, { id: uid(), from: connFrom, to: id }])
    }
    setConnFrom(null)
  }
  const delConn = id => setConns(prev => prev.filter(c => c.id !== id))

  // ── Add helpers ──────────────────────────────────────────
  const addCenter = type => {
    const r = canvasRef.current?.getBoundingClientRect()
    const cx = r ? r.width / 2 : 400, cy = r ? r.height / 2 : 300
    const x  = (cx - vp.x) / vp.z - NODE_TYPES[type].w / 2
    const y  = (cy - vp.y) / vp.z - NODE_TYPES[type].h / 2
    const nd = createNode(type, x, y)
    setNodes(prev => [...prev, nd]); setSelIds([nd.id])
  }

  const addAtPos = (type, px, py) => {
    const r = canvasRef.current?.getBoundingClientRect()
    if (!r) return
    const x  = (px - r.left - vp.x) / vp.z - NODE_TYPES[type].w / 2
    const y  = (py - r.top  - vp.y) / vp.z - NODE_TYPES[type].h / 2
    const nd = createNode(type, x, y)
    setNodes(prev => [...prev, nd]); setSelIds([nd.id])
  }

  // ── Pages ────────────────────────────────────────────────
  const addPage  = ()     => { const p = createPage(`Canvas ${pages.length + 1}`); setPages(prev => [...prev, p]); setActiveId(p.id); setSelIds([]) }
  const delPage  = id     => { if (pages.length === 1) return; const i = pages.findIndex(p => p.id === id); setPages(prev => prev.filter(p => p.id !== id)); setActiveId(pages[i > 0 ? i - 1 : 1]?.id) }
  const dupPage  = id     => { const p = pages.find(x => x.id === id); if (!p) return; const np = { ...p, id: pid(), name: p.name + ' (copie)', nodes: p.nodes.map(n => ({ ...n, id: uid() })), connections: [] }; setPages(prev => [...prev, np]); setActiveId(np.id) }
  const renamePg = (id, name) => { setPages(prev => prev.map(p => p.id === id ? { ...p, name } : p)); setEditId(null) }

  // ── Export / Import ──────────────────────────────────────
  const onExport = () => {
    const blob = new Blob([JSON.stringify({ proj, pages }, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = `${proj}.json`; a.click()
    notify('Exporté en JSON ✓')
  }

  const onImport = e => {
    const f = e.target.files?.[0]; if (!f) return
    const r = new FileReader()
    r.onload = ev => {
      try {
        const d = JSON.parse(ev.target.result)
        if (d.pages) { setProj(d.proj || 'Importé'); setPages(d.pages); setActiveId(d.pages[0].id); notify('Importé ✓') }
        else notify('Fichier invalide')
      } catch { notify('Erreur de parsing') }
    }
    r.readAsText(f)
  }

  const onSave = () => { saveToStorage({ proj, pages }); setSaved(true); notify('Sauvegardé ✓') }

  // ── Keyboard shortcuts ───────────────────────────────────
  useEffect(() => {
    const fn = e => {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Escape') { setSelIds([]); setConnFrom(null); setCtx(null) }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selIds.length) selIds.forEach(id => delNode(id))
      if (!e.ctrlKey && !e.metaKey) {
        if (e.key === 'v') setTool('select')
        if (e.key === 'h') setTool('hand')
        if (e.key === 't') setTool('text')
        if (e.key === 'n') setTool('note')
        if (e.key === 'i') setTool('image')
        if (e.key === 's') setTool('shape')
        if (e.key === 'd') setTool('table')
        if (e.key === 'l') setTool('link')
        if (e.key === 'm') setTool('mindmap')
        if (e.key === 'c') setTool('connect')
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); onSave() }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [selIds]) // eslint-disable-line

  const selNode = nodes.find(n => n.id === selIds[0])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#080808', color: '#e0e0e0', fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 13 }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        ::-webkit-scrollbar { width: 4px; height: 4px }
        ::-webkit-scrollbar-track { background: #0a0a0a }
        ::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 2px }
        * { box-sizing: border-box; margin: 0; padding: 0 }
        input, textarea, button { font-family: inherit }
      `}</style>

      <TopBar proj={proj} setProj={setProj} onSave={onSave} onExport={onExport} onImport={onImport} onUndo={() => notify('Annuler')} onRedo={() => notify('Refaire')} saved={saved} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <Sidebar tool={tool} setTool={setTool} tab={tab} setTab={setTab} nodes={nodes} selIds={selIds} setSelIds={setSelIds} onAddCenter={addCenter} />

        {/* ── Canvas ── */}
        <div
          ref={canvasRef}
          className="cv-bg"
          style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#080808', cursor: tool === 'hand' ? 'grab' : connFrom ? 'crosshair' : tool === 'select' ? 'default' : 'crosshair' }}
          onMouseDown={handleCanvasMD}
          onContextMenu={handleCtxMenu}
        >
          <CanvasGrid vp={vp} />

          {/* Transform layer */}
          <div className="cv-bg" style={{ position: 'absolute', top: 0, left: 0, transformOrigin: '0 0', transform: `translate(${vp.x}px,${vp.y}px) scale(${vp.z})`, willChange: 'transform' }}>
            <Connections nodes={nodes} conns={conns} selIds={selIds} onDelConn={delConn} />
            {nodes.map(n => (
              <CanvasNode
                key={n.id} n={n}
                sel={selIds.includes(n.id)}
                tool={tool}
                connFrom={connFrom}
                onSel={e => { if (e.shiftKey) setSelIds(prev => prev.includes(n.id) ? prev.filter(i => i !== n.id) : [...prev, n.id]); else setSelIds([n.id]) }}
                onDrag={dragNode}
                onResize={resNode}
                onUpdate={updNode}
                onDel={() => delNode(n.id)}
                onDup={() => dupNode(n.id)}
                onConnStart={id => connFrom ? connEnd(id) : connStart(id)}
                onConnEnd={connEnd}
              />
            ))}
          </div>

          {nodes.length === 0 && <EmptyState />}
          <ZoomBar vp={vp} setVp={setVp} />

          {/* Active tool hint */}
          {tool !== 'select' && tool !== 'hand' && (
            <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', background: '#0d0d0d', border: '1px solid #1e1e1e', color: '#444', fontSize: 10, padding: '3px 12px', borderRadius: 20, fontFamily: 'DM Mono,monospace', letterSpacing: '0.1em', pointerEvents: 'none' }}>
              {INSERT_TOOLS.find(t => t.id === tool)?.label?.toUpperCase() || tool.toUpperCase()} — cliquer pour placer
            </div>
          )}

          {/* Connection hint */}
          {connFrom && (
            <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', background: '#0d1020', border: '1px solid #2020aa', color: '#5555dd', fontSize: 10, padding: '3px 12px', borderRadius: 20, fontFamily: 'DM Mono,monospace', letterSpacing: '0.1em', pointerEvents: 'none' }}>
              CONNEXION — cliquer sur un autre nœud
            </div>
          )}

          {/* Context menu */}
          {ctx && (
            <ContextMenu x={ctx.x} y={ctx.y}
              onClose={() => setCtx(null)}
              onAdd={type => addAtPos(type, ctx.px, ctx.py)}
              onFit={() => setVp({ x: 0, y: 0, z: 1 })}
              onClear={() => { setNodes([]); setConns([]); setSelIds([]) }}
            />
          )}

          <Notif msg={notif} />
        </div>

        {/* ── Right panel ── */}
        {selIds.length === 1 && selNode && (
          <RightPanel
            node={selNode}
            onUpdate={updNode}
            onDel={() => { delNode(selNode.id) }}
            onDup={() => dupNode(selNode.id)}
            onClose={() => setSelIds([])}
          />
        )}
      </div>

      <BottomBar
        pages={pages} activeId={activeId} editId={editId}
        setActiveId={id => { setActiveId(id); setSelIds([]) }}
        onAdd={addPage} onDel={delPage} onDup={dupPage}
        onRenameStart={setEditId} onRenameDone={renamePg}
        nodeCount={nodes.length} connCount={conns.length} vp={vp}
      />
    </div>
  )
}
