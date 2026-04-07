import { useState, useRef, useEffect, useCallback } from 'react'

/* ─── tiny helpers ─────────────────────────────────────────── */
let _c = 0
const uid  = () => `n${Date.now()}${_c++}`
const pid  = () => `p${Date.now()}${_c++}`

const NODE_META = {
  text:    { w: 260, h: 160, label: 'Texte'       },
  note:    { w: 240, h: 200, label: 'Note'        },
  image:   { w: 300, h: 220, label: 'Image'       },
  shape:   { w: 140, h: 140, label: 'Forme'       },
  table:   { w: 320, h: 220, label: 'Tableau'     },
  link:    { w: 260, h: 120, label: 'Lien'        },
  mindmap: { w: 200, h:  80, label: 'Idée'        },
}

const mkNode = (type, x, y) => {
  const m = NODE_META[type] || NODE_META.text
  const base = { id: uid(), type, x, y, w: m.w, h: m.h, title: m.label, zIndex: _c }
  if (type === 'text')    return { ...base, content: 'Double-clic pour éditer…', fontSize: 14 }
  if (type === 'note')    return { ...base, content: '' }
  if (type === 'image')   return { ...base, url: '' }
  if (type === 'shape')   return { ...base, shape: 'circle' }
  if (type === 'table')   return { ...base, rows: [['Colonne A','Colonne B','Colonne C'],['Cellule','Cellule','Cellule']] }
  if (type === 'link')    return { ...base, url: '' }
  if (type === 'mindmap') return { ...base, content: 'Idée' }
  return base
}

const mkPage = (name = 'Canvas') => ({ id: pid(), name, nodes: [], connections: [] })

const SAVE_KEY = 'canvos_v2'
const load = () => { try { const r = localStorage.getItem(SAVE_KEY); return r ? JSON.parse(r) : null } catch { return null } }
const save = d => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(d)) } catch {} }

/* ─── icon paths ───────────────────────────────────────────── */
const P = {
  select:  'M6 2l12 10-7 1-3 7z',
  hand:    'M18 11V8a2 2 0 0 0-4 0v3M14 8V6a2 2 0 0 0-4 0v2M10 7V5a2 2 0 0 0-4 0v9l-2-3a2 2 0 0 0-3 3l4 6h10a4 4 0 0 0 4-4v-6a2 2 0 0 0-4 0',
  text:    'M4 6h16M12 4v16M9 20h6',
  note:    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  image:   'M3 3h18v18H3zM8.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21',
  circle:  'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
  table:   'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18',
  link:    'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l2-2',
  mind:    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM2 12h6M16 12h6M12 2v6M12 16v6',
  connect: 'M18 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM9 6l6 9',
  plus:    'M12 5v14M5 12h14',
  trash:   'M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6',
  copy:    'M9 9h11v11H9zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
  save:    'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8',
  dl:      'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  ul:      'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  fit:     'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3',
  x:       'M18 6L6 18M6 6l12 12',
  edit:    'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
  layers:  'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  search:  'M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z',
  grid:    'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  zoomin:  'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.35-4.35M11 8v6M8 11h6',
  zoomout: 'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.35-4.35M8 11h6',
}

function Ico({ n, s = 16, col = 'currentColor' }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={P[n] || ''} />
    </svg>
  )
}

/* ─── Tooltip ──────────────────────────────────────────────── */
function Tip({ children, label }) {
  const [v, sv] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => sv(true)} onMouseLeave={() => sv(false)}>
      {children}
      {v && label && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 5px)', left: '50%',
          transform: 'translateX(-50%)', background: '#111', border: '1px solid #222',
          color: '#aaa', fontSize: 10, padding: '2px 7px', borderRadius: 4,
          whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 9999,
          fontFamily: 'DM Mono,monospace',
        }}>
          {label}
        </div>
      )}
    </div>
  )
}

/* ─── Icon button ──────────────────────────────────────────── */
function IBtn({ icon, label, active, onClick, red, sz = 14 }) {
  const [h, sh] = useState(false)
  return (
    <Tip label={label}>
      <button onClick={onClick}
        onMouseEnter={() => sh(true)} onMouseLeave={() => sh(false)}
        style={{
          width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: active ? '#1e1e1e' : h ? '#141414' : 'transparent',
          border: `1px solid ${active ? '#303030' : h ? '#1e1e1e' : 'transparent'}`,
          borderRadius: 5, cursor: 'pointer', transition: 'all .1s', flexShrink: 0,
          color: red ? (h ? '#ff6060' : '#662020') : active ? '#ddd' : h ? '#aaa' : '#555',
        }}>
        <Ico n={icon} s={sz} />
      </button>
    </Tip>
  )
}

/* ─── Node colors ──────────────────────────────────────────── */
const NC = {
  text:    { bg: '#111',    bd: '#1c1c1c', ac: '#e0e0e0' },
  note:    { bg: '#131310', bd: '#1e1e18', ac: '#c8c050' },
  image:   { bg: '#0d1211', bd: '#182020', ac: '#50c8a0' },
  shape:   { bg: '#110d0d', bd: '#1e1515', ac: '#c87050' },
  table:   { bg: '#0d0d14', bd: '#15152a', ac: '#7070e0' },
  link:    { bg: '#100d13', bd: '#1a1520', ac: '#a070c0' },
  mindmap: { bg: '#0d1111', bd: '#152020', ac: '#50b8b8' },
}
const TOOL_ICON = { text:'text', note:'note', image:'image', shape:'circle', table:'table', link:'link', mindmap:'mind', connect:'connect', select:'select', hand:'hand' }

/* ─── Canvas Grid ──────────────────────────────────────────── */
function Grid({ vp }) {
  const gs = 28 * vp.z, ox = vp.x % gs, oy = vp.y % gs
  return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}>
      <defs>
        <pattern id="sg" x={ox} y={oy} width={gs} height={gs} patternUnits="userSpaceOnUse">
          <path d={`M${gs} 0L0 0 0 ${gs}`} fill="none" stroke="#101010" strokeWidth="1"/>
        </pattern>
        <pattern id="lg" x={ox} y={oy} width={gs*5} height={gs*5} patternUnits="userSpaceOnUse">
          <rect width={gs*5} height={gs*5} fill="url(#sg)"/>
          <path d={`M${gs*5} 0L0 0 0 ${gs*5}`} fill="none" stroke="#151515" strokeWidth="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#lg)"/>
    </svg>
  )
}

/* ─── Connections ──────────────────────────────────────────── */
function Conns({ nodes, conns, selIds, onDel }) {
  return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', overflow:'visible', pointerEvents:'none' }}>
      <defs>
        <marker id="a0" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0,8 3,0 6" fill="#252525"/>
        </marker>
        <marker id="a1" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0,8 3,0 6" fill="#555"/>
        </marker>
      </defs>
      {conns.map(c => {
        const a = nodes.find(n => n.id === c.from)
        const b = nodes.find(n => n.id === c.to)
        if (!a || !b) return null
        const ax = a.x+a.w/2, ay = a.y+a.h/2
        const bx = b.x+b.w/2, by = b.y+b.h/2
        const sel = selIds.includes(a.id)||selIds.includes(b.id)
        return (
          <path key={c.id}
            d={`M${ax},${ay} Q${(ax+bx)/2},${ay} ${bx},${by}`}
            fill="none" stroke={sel?'#444':'#1e1e1e'} strokeWidth={sel?2:1.5}
            strokeDasharray="5,4" markerEnd={`url(#${sel?'a1':'a0'})`}
            style={{ pointerEvents:'stroke', cursor:'pointer' }}
            onClick={e => { e.stopPropagation(); onDel(c.id) }}
          />
        )
      })}
    </svg>
  )
}

/* ─── Node component ───────────────────────────────────────── */
function Node({ n, sel, tool, connFrom, onSel, onDrag, onResize, onUpdate, onDel, onDup, onPortDown, onConnEnd }) {
  const [editing, setEd] = useState(false)
  const [hov, sHov] = useState(false)
  const col = NC[n.type] || NC.text

  const handleMD = e => {
    if (editing) return
    const tag = e.target.tagName
    if (tag==='TEXTAREA'||tag==='INPUT'||tag==='BUTTON') return
    e.stopPropagation()
    if (tool==='connect') { connFrom ? onConnEnd(n.id) : onPortDown(n.id); return }
    onSel(e)
    if (tool!=='select') return
    let lx=e.clientX, ly=e.clientY
    const mv = e2 => { onDrag(n.id, e2.clientX-lx, e2.clientY-ly); lx=e2.clientX; ly=e2.clientY }
    const up = () => { removeEventListener('mousemove',mv); removeEventListener('mouseup',up) }
    addEventListener('mousemove',mv); addEventListener('mouseup',up)
  }

  const handleRMD = e => {
    e.stopPropagation(); e.preventDefault()
    let lx=e.clientX, ly=e.clientY
    const mv = e2 => { onResize(n.id, e2.clientX-lx, e2.clientY-ly); lx=e2.clientX; ly=e2.clientY }
    const up = () => { removeEventListener('mousemove',mv); removeEventListener('mouseup',up) }
    addEventListener('mousemove',mv); addEventListener('mouseup',up)
  }

  const icn = TOOL_ICON[n.type] || 'text'

  return (
    <div onMouseDown={handleMD}
      onDoubleClick={() => { if (tool==='select'&&!connFrom) setEd(true) }}
      onMouseEnter={() => sHov(true)} onMouseLeave={() => sHov(false)}
      style={{
        position:'absolute', left:n.x, top:n.y, width:n.w, height:n.h,
        background: col.bg,
        border: `1px solid ${sel ? 'rgba(255,255,255,.22)' : col.bd}`,
        borderRadius: 7,
        boxShadow: sel
          ? '0 0 0 1.5px rgba(255,255,255,.1), 0 8px 32px rgba(0,0,0,.7)'
          : hov ? '0 4px 20px rgba(0,0,0,.5)' : '0 2px 8px rgba(0,0,0,.3)',
        display:'flex', flexDirection:'column', overflow:'hidden',
        cursor: tool==='connect' ? 'crosshair' : 'default',
        zIndex: sel ? 999 : (n.zIndex||1),
        transition:'box-shadow .15s, border-color .15s',
      }}>

      {/* header */}
      <div style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 8px', borderBottom:`1px solid ${col.bd}`, background:'rgba(0,0,0,.15)', flexShrink:0, minHeight:26 }}>
        <span style={{ color:col.ac, opacity:.6, display:'flex', flexShrink:0 }}><Ico n={icn} s={10}/></span>
        <span style={{ flex:1, fontSize:10, color:'#3a3a3a', fontFamily:'DM Mono,monospace', textTransform:'uppercase', letterSpacing:'.05em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {n.title}
        </span>
        {(sel||hov) && (
          <div style={{ display:'flex', gap:1 }} onMouseDown={e=>e.stopPropagation()}>
            <Tip label="Connecter"><button onClick={()=>onPortDown(n.id)} style={aBtn}><Ico n="connect" s={10}/></button></Tip>
            <Tip label="Dupliquer"><button onClick={onDup} style={aBtn}><Ico n="copy" s={10}/></button></Tip>
            <Tip label="Supprimer"><button onClick={onDel} style={{...aBtn,color:'#662222'}}><Ico n="trash" s={10}/></button></Tip>
          </div>
        )}
      </div>

      {/* content */}
      <div style={{ flex:1, overflow:'hidden', position:'relative' }}>
        {n.type==='text'    && <TextC    n={n} editing={editing} setEd={setEd} onUpdate={onUpdate}/>}
        {n.type==='note'    && <NoteC    n={n} editing={editing} setEd={setEd} onUpdate={onUpdate}/>}
        {n.type==='image'   && <ImageC   n={n} onUpdate={onUpdate}/>}
        {n.type==='shape'   && <ShapeC   n={n} onUpdate={onUpdate} col={col}/>}
        {n.type==='table'   && <TableC   n={n} onUpdate={onUpdate}/>}
        {n.type==='link'    && <LinkC    n={n} onUpdate={onUpdate}/>}
        {n.type==='mindmap' && <MindC    n={n} editing={editing} setEd={setEd} onUpdate={onUpdate} col={col}/>}
      </div>

      {/* ports */}
      {(sel||hov||connFrom) && [
        { k:'r', s:{ right:-5,  top:'50%', transform:'translateY(-50%)' }},
        { k:'l', s:{ left:-5,   top:'50%', transform:'translateY(-50%)' }},
        { k:'t', s:{ top:-5,    left:'50%',transform:'translateX(-50%)' }},
        { k:'b', s:{ bottom:-5, left:'50%',transform:'translateX(-50%)' }},
      ].map(({ k,s }) => (
        <div key={k} onMouseDown={e=>{e.stopPropagation();onPortDown(n.id)}}
          style={{ position:'absolute',...s, width:10,height:10,borderRadius:'50%', background:connFrom===n.id?'#fff':'#1e1e1e', border:`1.5px solid ${connFrom===n.id?'#fff':'#333'}`, cursor:'crosshair',zIndex:20 }}/>
      ))}

      {/* resize */}
      {sel && (
        <div onMouseDown={handleRMD}
          style={{ position:'absolute',bottom:0,right:0,width:16,height:16,cursor:'nwse-resize',display:'flex',alignItems:'flex-end',justifyContent:'flex-end',padding:3,zIndex:10 }}>
          <svg width="7" height="7" viewBox="0 0 7 7"><line x1="0" y1="7" x2="7" y2="0" stroke="#2a2a2a" strokeWidth="1.5"/><line x1="3" y1="7" x2="7" y2="3" stroke="#2a2a2a" strokeWidth="1.5"/></svg>
        </div>
      )}
    </div>
  )
}

const aBtn = { background:'transparent', border:'none', color:'#383838', cursor:'pointer', padding:'2px 3px', display:'flex', alignItems:'center', borderRadius:3 }

/* ─── Node content components ──────────────────────────────── */
function TextC({ n, editing, setEd, onUpdate }) {
  const empty = n.content === 'Double-clic pour éditer…'
  return editing ? (
    <textarea autoFocus defaultValue={n.content}
      style={{ width:'100%',height:'100%',background:'transparent',border:'none',color:'#d0d0d0',fontSize:n.fontSize||14,lineHeight:1.65,resize:'none',outline:'none',padding:10,fontFamily:'inherit' }}
      onBlur={e=>{onUpdate(n.id,{content:e.target.value});setEd(false)}}
      onKeyDown={e=>{if(e.key==='Escape'){onUpdate(n.id,{content:e.target.value});setEd(false)}}}
    />
  ) : (
    <div style={{ padding:10,color:empty?'#282828':'#c8c8c8',fontSize:n.fontSize||14,lineHeight:1.65,whiteSpace:'pre-wrap',wordBreak:'break-word',height:'100%',overflow:'hidden' }}>
      {n.content||'Double-clic pour éditer…'}
    </div>
  )
}

function NoteC({ n, editing, setEd, onUpdate }) {
  return (
    <div style={{ height:'100%',display:'flex',flexDirection:'column' }}>
      {editing ? (
        <textarea autoFocus defaultValue={n.content}
          style={{ flex:1,background:'transparent',border:'none',color:'#b0a870',fontSize:12,lineHeight:1.7,resize:'none',outline:'none',padding:10,fontFamily:'inherit' }}
          onBlur={e=>{onUpdate(n.id,{content:e.target.value});setEd(false)}}/>
      ) : (
        <div style={{ flex:1,padding:10,color:n.content?'#908870':'#252520',fontSize:12,lineHeight:1.7,whiteSpace:'pre-wrap',overflow:'hidden' }}>
          {n.content||'Double-clic pour écrire…'}
        </div>
      )}
    </div>
  )
}

function ImageC({ n, onUpdate }) {
  return (
    <div style={{ height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:12,gap:8 }}>
      {n.url ? (
        <img src={n.url} alt="" style={{ maxWidth:'100%',maxHeight:'calc(100% - 8px)',objectFit:'contain',borderRadius:4 }} onError={e=>{e.target.style.display='none'}}/>
      ) : (
        <>
          <div style={{ color:'#1e2e2a' }}><Ico n="image" s={28}/></div>
          <div style={{ fontSize:11,color:'#333',textAlign:'center' }}>Coller une URL d'image</div>
          <input placeholder="https://…" onClick={e=>e.stopPropagation()}
            style={{ width:'100%',background:'#080808',border:'1px solid #1a1a1a',color:'#888',padding:'4px 8px',borderRadius:3,fontSize:11,outline:'none' }}
            onKeyDown={e=>{if(e.key==='Enter')onUpdate(n.id,{url:e.target.value})}}/>
        </>
      )}
    </div>
  )
}

function ShapeC({ n, onUpdate, col }) {
  const shapes = {
    circle:   <ellipse cx="50%" cy="50%" rx="43%" ry="43%" fill="none" stroke={col.ac} strokeWidth="1.5" opacity="0.35"/>,
    rect:     <rect x="8%" y="8%" width="84%" height="84%" fill="none" stroke={col.ac} strokeWidth="1.5" opacity="0.35" rx="4"/>,
    diamond:  <polygon points="50,8 92,50 50,92 8,50" fill="none" stroke={col.ac} strokeWidth="1.5" opacity="0.35"/>,
    triangle: <polygon points="50,8 92,92 8,92" fill="none" stroke={col.ac} strokeWidth="1.5" opacity="0.35"/>,
    star:     <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="none" stroke={col.ac} strokeWidth="1.5" opacity="0.35"/>,
  }
  return (
    <div style={{ height:'100%',position:'relative' }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {shapes[n.shape||'circle']}
      </svg>
      <div onMouseDown={e=>e.stopPropagation()}
        style={{ position:'absolute',bottom:6,left:0,right:0,display:'flex',justifyContent:'center',gap:4 }}>
        {Object.keys(shapes).map(s=>(
          <button key={s} onClick={()=>onUpdate(n.id,{shape:s})}
            style={{ width:18,height:18,borderRadius:2,background:n.shape===s?'#222':'#111',border:`1px solid ${n.shape===s?'#333':'#1a1a1a'}`,color:'#444',cursor:'pointer',fontSize:8,fontFamily:'DM Mono,monospace' }}>
            {s[0].toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}

function TableC({ n, onUpdate }) {
  const rows = n.rows||[['A','B'],['1','2']]
  return (
    <div style={{ height:'100%',overflow:'auto',padding:4 }}>
      <table style={{ width:'100%',borderCollapse:'collapse',fontSize:11 }}>
        <tbody>
          {rows.map((r,ri)=>(
            <tr key={ri} style={{ borderBottom:'1px solid #141420' }}>
              {r.map((c,ci)=>(
                <td key={ci} style={{ padding:'3px 7px',color:ri===0?'#7070d0':'#9090c0',fontWeight:ri===0?500:400,background:ri===0?'rgba(80,80,180,.06)':'transparent',fontFamily:ri===0?'DM Mono,monospace':'inherit',fontSize:ri===0?10:11 }}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div onMouseDown={e=>e.stopPropagation()}>
        <button onClick={()=>onUpdate(n.id,{rows:[...rows,rows[0].map(()=>'')]})}
          style={{ marginTop:4,fontSize:10,color:'#333',background:'transparent',border:'1px dashed #1a1a2a',borderRadius:3,padding:'2px 8px',cursor:'pointer',width:'100%' }}>
          + ligne
        </button>
      </div>
    </div>
  )
}

function LinkC({ n, onUpdate }) {
  return (
    <div style={{ height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:10,gap:6 }}>
      <div style={{ color:'#2a1a3a' }}><Ico n="link" s={20}/></div>
      <div style={{ fontSize:11,color:'#555',maxWidth:'100%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{n.url||'Ajouter une URL'}</div>
      <input placeholder="https://…" defaultValue={n.url} onClick={e=>e.stopPropagation()}
        style={{ width:'100%',background:'#080808',border:'1px solid #1a1a1a',color:'#888',padding:'3px 7px',borderRadius:3,fontSize:11,outline:'none' }}
        onKeyDown={e=>{if(e.key==='Enter')onUpdate(n.id,{url:e.target.value})}}/>
    </div>
  )
}

function MindC({ n, editing, setEd, onUpdate, col }) {
  return (
    <div style={{ height:'100%',display:'flex',alignItems:'center',justifyContent:'center',padding:10 }}>
      {editing ? (
        <input autoFocus defaultValue={n.content}
          style={{ width:'100%',background:'transparent',border:'none',borderBottom:`1px solid ${col.ac}`,color:'#ddd',fontSize:14,fontWeight:500,outline:'none',textAlign:'center',fontFamily:'inherit' }}
          onBlur={e=>{onUpdate(n.id,{content:e.target.value});setEd(false)}}
          onKeyDown={e=>{if(e.key==='Enter'||e.key==='Escape'){onUpdate(n.id,{content:e.target.value});setEd(false)}}}/>
      ) : (
        <div style={{ fontSize:14,fontWeight:500,color:'#ccc',textAlign:'center',lineHeight:1.4,borderBottom:`1px solid ${col.ac}33`,paddingBottom:4,width:'100%' }}>
          {n.content||'Idée'}
        </div>
      )}
    </div>
  )
}

/* ─── Empty state ──────────────────────────────────────────── */
function Empty() {
  return (
    <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',textAlign:'center',pointerEvents:'none',userSelect:'none' }}>
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ opacity:.05,marginBottom:14 }}>
        <rect x="3" y="3" width="26" height="26" stroke="white" strokeWidth="1.5" rx="2"/>
        <rect x="35" y="3" width="26" height="26" stroke="white" strokeWidth="1.5" rx="2" opacity=".5"/>
        <rect x="3" y="35" width="26" height="26" stroke="white" strokeWidth="1.5" rx="2" opacity=".5"/>
        <rect x="35" y="35" width="26" height="26" stroke="white" strokeWidth="1.5" rx="2"/>
      </svg>
      <div style={{ fontSize:14,color:'#1c1c1c',fontWeight:500,marginBottom:5 }}>Canvas vide</div>
      <div style={{ fontSize:11,color:'#151515',lineHeight:1.7 }}>Clic droit pour ajouter · ou choisissez un outil à gauche</div>
    </div>
  )
}

/* ─── Context menu ─────────────────────────────────────────── */
const INSERTS = [
  {id:'text',icon:'text',label:'Texte'},
  {id:'note',icon:'note',label:'Note'},
  {id:'image',icon:'image',label:'Image'},
  {id:'shape',icon:'circle',label:'Forme'},
  {id:'table',icon:'table',label:'Tableau'},
  {id:'link',icon:'link',label:'Lien'},
  {id:'mindmap',icon:'mind',label:'Idée'},
]

function CtxMenu({ x, y, onClose, onAdd, onFit, onClear }) {
  useEffect(() => {
    const h = () => onClose()
    window.addEventListener('click', h)
    return () => window.removeEventListener('click', h)
  }, [])
  const CI = ({ icon, label, onClick, red }) => {
    const [h, sh] = useState(false)
    return (
      <button onClick={onClick} onMouseEnter={()=>sh(true)} onMouseLeave={()=>sh(false)}
        style={{ display:'flex',alignItems:'center',gap:8,padding:'5px 10px',background:h?'#151515':'transparent',border:'none',color:red?(h?'#ff5555':'#662222'):(h?'#aaa':'#555'),fontSize:11,cursor:'pointer',borderRadius:4,width:'100%',textAlign:'left',fontFamily:'inherit' }}>
        <Ico n={icon} s={12}/>{label}
      </button>
    )
  }
  return (
    <div onClick={e=>e.stopPropagation()}
      style={{ position:'absolute',left:x,top:y,background:'#0e0e0e',border:'1px solid #1e1e1e',borderRadius:8,padding:5,zIndex:9000,minWidth:165,boxShadow:'0 8px 32px rgba(0,0,0,.85)' }}>
      <div style={{ fontSize:9,color:'#252525',padding:'3px 10px 5px',textTransform:'uppercase',letterSpacing:'.1em',fontFamily:'DM Mono,monospace' }}>Ajouter</div>
      {INSERTS.map(t => <CI key={t.id} icon={t.icon} label={t.label} onClick={()=>{onAdd(t.id);onClose()}}/>)}
      <div style={{ height:1,background:'#141414',margin:'4px 0' }}/>
      <CI icon="fit"   label="Réinitialiser la vue" onClick={()=>{onFit();onClose()}}/>
      <CI icon="trash" label="Vider le canvas" red  onClick={()=>{onClear();onClose()}}/>
    </div>
  )
}

/* ─── Sidebar ──────────────────────────────────────────────── */
const NAV = [
  {id:'select',icon:'select',label:'Sélection',key:'V'},
  {id:'hand',  icon:'hand',  label:'Déplacement',key:'H'},
]

function Sidebar({ tool, setTool, tab, setTab, nodes, selIds, setSelIds, onAddCenter }) {
  const [q, sq] = useState('')
  const sl = { fontSize:9,color:'#252525',textTransform:'uppercase',letterSpacing:'.12em',fontFamily:'DM Mono,monospace',fontWeight:500,marginBottom:7 }
  const filtered = nodes.filter(n => !q || (n.title+n.type+(n.content||'')).toLowerCase().includes(q.toLowerCase()))

  const SBtn = ({ id, icon, label, key: k }) => {
    const active = tool===id
    const [h,sh]=useState(false)
    return (
      <button onClick={()=>setTool(id)} onMouseEnter={()=>sh(true)} onMouseLeave={()=>sh(false)}
        style={{ display:'flex',alignItems:'center',gap:7,width:'100%',padding:'6px 8px',background:active?'#161616':h?'#0f0f0f':'transparent',border:`1px solid ${active?'#202020':'transparent'}`,borderRadius:4,color:active?'#ddd':h?'#888':'#444',cursor:'pointer',fontSize:12,marginBottom:2,textAlign:'left' }}>
        <Ico n={icon} s={13}/><span style={{flex:1}}>{label}</span>
        <span style={{fontSize:10,color:'#1e1e1e',fontFamily:'DM Mono,monospace'}}>{k}</span>
      </button>
    )
  }

  return (
    <div style={{ width:210,background:'#0b0b0b',borderRight:'1px solid #141414',display:'flex',flexShrink:0,overflow:'hidden' }}>
      {/* icon strip */}
      <div style={{ width:40,background:'#090909',borderRight:'1px solid #111',display:'flex',flexDirection:'column',alignItems:'center',paddingTop:8,gap:2 }}>
        {[{id:'tools',icon:'grid'},{id:'layers',icon:'layers'},{id:'search',icon:'search'}].map(t=>(
          <Tip key={t.id} label={t.id}>
            <button onClick={()=>setTab(t.id)}
              style={{ width:30,height:30,display:'flex',alignItems:'center',justifyContent:'center',background:tab===t.id?'#171717':'transparent',border:'none',color:tab===t.id?'#888':'#2e2e2e',cursor:'pointer',borderRadius:5 }}>
              <Ico n={t.icon} s={14}/>
            </button>
          </Tip>
        ))}
      </div>
      {/* panel */}
      <div style={{ flex:1,overflow:'auto',padding:10 }}>
        {tab==='tools' && (
          <>
            <div style={sl}>Navigation</div>
            {NAV.map(t=><SBtn key={t.id} {...t}/>)}
            <div style={{ height:1,background:'#111',margin:'10px 0' }}/>
            <div style={sl}>Insérer</div>
            {[...INSERTS,{id:'connect',icon:'connect',label:'Connecter',key:'C'}].map(t=><SBtn key={t.id} {...t} key2={t.key||''} k={t.key}/>)}
            <div style={{ height:1,background:'#111',margin:'10px 0' }}/>
            <div style={sl}>Ajout rapide</div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:4 }}>
              {INSERTS.map(t=>(
                <Tip key={t.id} label={t.label}>
                  <button onClick={()=>onAddCenter(t.id)}
                    style={{ aspectRatio:1,background:'#0f0f0f',border:'1px solid #1a1a1a',borderRadius:5,display:'flex',alignItems:'center',justifyContent:'center',color:'#444',cursor:'pointer',width:'100%' }}>
                    <Ico n={t.icon} s={13}/>
                  </button>
                </Tip>
              ))}
            </div>
          </>
        )}
        {tab==='layers' && (
          <>
            <div style={sl}>Calques ({nodes.length})</div>
            {nodes.length===0 && <div style={{fontSize:11,color:'#1a1a1a',textAlign:'center',paddingTop:20}}>Aucun élément</div>}
            {[...nodes].reverse().map(n=>(
              <div key={n.id} onClick={()=>setSelIds([n.id])}
                style={{ display:'flex',alignItems:'center',gap:6,padding:'5px 6px',borderRadius:4,cursor:'pointer',background:selIds.includes(n.id)?'#151515':'transparent',color:selIds.includes(n.id)?'#bbb':'#444',fontSize:11,marginBottom:1 }}>
                <Ico n={TOOL_ICON[n.type]||'text'} s={11}/>
                <span style={{ flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{n.title}</span>
                <span style={{ fontSize:9,color:'#1a1a1a',fontFamily:'DM Mono,monospace',textTransform:'uppercase' }}>{n.type}</span>
              </div>
            ))}
          </>
        )}
        {tab==='search' && (
          <>
            <input placeholder="Rechercher…" value={q} onChange={e=>sq(e.target.value)}
              style={{ width:'100%',background:'#0e0e0e',border:'1px solid #181818',color:'#ccc',fontSize:12,padding:'5px 8px',borderRadius:4,outline:'none',marginBottom:8 }}/>
            {filtered.map(n=>(
              <div key={n.id} onClick={()=>setSelIds([n.id])}
                style={{ display:'flex',alignItems:'center',gap:6,padding:'5px 6px',borderRadius:4,cursor:'pointer',color:'#555',fontSize:11,marginBottom:1 }}>
                <Ico n={TOOL_ICON[n.type]||'text'} s={11}/>
                <span style={{ flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{n.title||n.content||n.type}</span>
              </div>
            ))}
            {q&&filtered.length===0&&<div style={{fontSize:11,color:'#1a1a1a',textAlign:'center',paddingTop:12}}>Aucun résultat</div>}
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Right panel ──────────────────────────────────────────── */
function RPanel({ node, onUpdate, onDel, onDup, onClose }) {
  if (!node) return null
  const inp = { width:'100%',background:'#0e0e0e',border:'1px solid #171717',color:'#888',fontSize:11,padding:'4px 7px',borderRadius:3,outline:'none',fontFamily:'DM Mono,monospace',boxSizing:'border-box' }
  const lbl = { fontSize:9,color:'#222',marginBottom:3,fontFamily:'DM Mono,monospace' }
  const Row = ({ label, children }) => (
    <div style={{ marginBottom:14 }}>
      <div style={{ fontSize:9,color:'#252525',textTransform:'uppercase',letterSpacing:'.1em',fontFamily:'DM Mono,monospace',marginBottom:5 }}>{label}</div>
      {children}
    </div>
  )
  return (
    <div style={{ width:196,background:'#0b0b0b',borderLeft:'1px solid #141414',display:'flex',flexDirection:'column',flexShrink:0,overflow:'hidden' }}>
      <div style={{ display:'flex',alignItems:'center',padding:'9px 12px',borderBottom:'1px solid #121212' }}>
        <span style={{ fontSize:10,color:'#333',textTransform:'uppercase',letterSpacing:'.08em',fontFamily:'DM Mono,monospace',flex:1 }}>{node.type}</span>
        <div style={{ display:'flex',gap:2 }}>
          <IBtn icon="copy"  sz={13} onClick={onDup}   label="Dupliquer"/>
          <IBtn icon="trash" sz={13} onClick={onDel}   label="Supprimer" red/>
          <IBtn icon="x"     sz={13} onClick={onClose} label="Fermer"/>
        </div>
      </div>
      <div style={{ padding:12,overflow:'auto',flex:1 }}>
        <Row label="Titre">
          <input defaultValue={node.title} style={inp} onBlur={e=>onUpdate(node.id,{title:e.target.value})}/>
        </Row>
        <Row label="Position">
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:5 }}>
            <div><div style={lbl}>X</div><input value={Math.round(node.x)} readOnly style={inp}/></div>
            <div><div style={lbl}>Y</div><input value={Math.round(node.y)} readOnly style={inp}/></div>
          </div>
        </Row>
        <Row label="Taille">
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:5 }}>
            <div><div style={lbl}>L</div><input value={Math.round(node.w)} readOnly style={inp}/></div>
            <div><div style={lbl}>H</div><input value={Math.round(node.h)} readOnly style={inp}/></div>
          </div>
        </Row>
        {node.type==='text' && (
          <Row label="Police">
            <input type="range" min="10" max="36" value={node.fontSize||14} onChange={e=>onUpdate(node.id,{fontSize:+e.target.value})} style={{ width:'100%',accentColor:'#444' }}/>
            <span style={{ fontSize:10,color:'#333',fontFamily:'DM Mono,monospace' }}>{node.fontSize||14}px</span>
          </Row>
        )}
        {node.type==='shape' && (
          <Row label="Forme">
            <div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
              {['circle','rect','diamond','triangle','star'].map(s=>(
                <button key={s} onClick={()=>onUpdate(node.id,{shape:s})}
                  style={{ padding:'3px 6px',background:node.shape===s?'#1a1a1a':'#0f0f0f',border:`1px solid ${node.shape===s?'#2a2a2a':'#1a1a1a'}`,color:node.shape===s?'#aaa':'#444',fontSize:10,borderRadius:3,cursor:'pointer',fontFamily:'DM Mono,monospace' }}>
                  {s[0].toUpperCase()}
                </button>
              ))}
            </div>
          </Row>
        )}
      </div>
    </div>
  )
}

/* ─── Bottom bar ───────────────────────────────────────────── */
function BottomBar({ pages, activeId, editId, setActive, onAdd, onDel, onDup, onRename, onRenameDone, nc, cc, zoom }) {
  const [pm, spm] = useState(null)
  return (
    <div style={{ height:34,background:'#090909',borderTop:'1px solid #121212',display:'flex',alignItems:'center',flexShrink:0,position:'relative',zIndex:100 }}>
      <div style={{ display:'flex',alignItems:'center',flex:1,overflow:'auto',padding:'0 8px',gap:2 }}>
        {pages.map(p=>(
          <div key={p.id} onClick={()=>setActive(p.id)}
            onContextMenu={e=>{e.preventDefault();spm({x:e.clientX,y:e.clientY-110,id:p.id})}}
            style={{ display:'flex',alignItems:'center',gap:5,padding:'0 10px',height:24,background:activeId===p.id?'#131313':'transparent',border:`1px solid ${activeId===p.id?'#1e1e1e':'transparent'}`,borderRadius:4,color:activeId===p.id?'#bbb':'#383838',fontSize:11,cursor:'pointer',whiteSpace:'nowrap',userSelect:'none' }}>
            {editId===p.id ? (
              <input autoFocus defaultValue={p.name} onClick={e=>e.stopPropagation()}
                style={{ background:'transparent',border:'none',color:'#ddd',fontSize:11,outline:'none',width:80,fontFamily:'inherit' }}
                onBlur={e=>onRenameDone(p.id,e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter')onRenameDone(p.id,e.target.value);if(e.key==='Escape')onRenameDone(p.id,p.name)}}/>
            ) : (
              <span onDoubleClick={e=>{e.stopPropagation();onRename(p.id)}}>{p.name}</span>
            )}
            {activeId===p.id&&pages.length>1&&(
              <span onClick={e=>{e.stopPropagation();onDel(p.id)}} style={{ color:'#2a2a2a',cursor:'pointer',lineHeight:1,paddingLeft:2,fontSize:14 }}>×</span>
            )}
          </div>
        ))}
        <button onClick={onAdd}
          style={{ width:24,height:24,background:'transparent',border:'1px solid #1a1a1a',borderRadius:4,color:'#2a2a2a',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',marginLeft:2,flexShrink:0 }}>
          <Ico n="plus" s={12}/>
        </button>
      </div>
      <div style={{ display:'flex',alignItems:'center',gap:5,padding:'0 12px',fontSize:10,color:'#1c1c1c',fontFamily:'DM Mono,monospace',borderLeft:'1px solid #111',height:'100%',flexShrink:0 }}>
        <span>{nc} él.</span><span style={{color:'#0e0e0e'}}>·</span>
        <span>{cc} conn.</span><span style={{color:'#0e0e0e'}}>·</span>
        <span>{Math.round(zoom*100)}%</span>
      </div>
      {pm && (
        <div style={{ position:'fixed',left:pm.x,top:pm.y,background:'#0e0e0e',border:'1px solid #1e1e1e',borderRadius:6,padding:4,zIndex:9999,minWidth:135,boxShadow:'0 4px 20px rgba(0,0,0,.85)' }}>
          {[{l:'Renommer',a:()=>{onRename(pm.id);spm(null)}},{l:'Dupliquer',a:()=>{onDup(pm.id);spm(null)}},{l:'Supprimer',a:()=>{onDel(pm.id);spm(null)},d:true}].map(it=>(
            <button key={it.l} onClick={it.a}
              style={{ display:'block',width:'100%',textAlign:'left',padding:'5px 10px',background:'transparent',border:'none',color:it.d?'#773333':'#777',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'inherit' }}>
              {it.l}
            </button>
          ))}
          <div style={{ position:'fixed',inset:0,zIndex:-1 }} onClick={()=>spm(null)}/>
        </div>
      )}
    </div>
  )
}

/* ─── Zoom bar ─────────────────────────────────────────────── */
function ZBar({ vp, setVp }) {
  const zb = { background:'transparent',border:'none',color:'#3a3a3a',cursor:'pointer',padding:'3px 5px',display:'flex',alignItems:'center',borderRadius:3 }
  return (
    <div style={{ position:'absolute',bottom:14,right:14,display:'flex',alignItems:'center',gap:4,background:'#0d0d0d',border:'1px solid #1a1a1a',borderRadius:7,padding:'4px 6px',boxShadow:'0 4px 20px rgba(0,0,0,.6)',zIndex:100 }}>
      <button style={zb} onClick={()=>setVp(v=>({...v,z:Math.max(.1,+(v.z-.1).toFixed(1))}))}><Ico n="zoomout" s={13}/></button>
      <span style={{ fontSize:10,color:'#2a2a2a',fontFamily:'DM Mono,monospace',minWidth:34,textAlign:'center' }}>{Math.round(vp.z*100)}%</span>
      <button style={zb} onClick={()=>setVp(v=>({...v,z:Math.min(4,+(v.z+.1).toFixed(1))}))}><Ico n="zoomin" s={13}/></button>
      <div style={{ width:1,height:14,background:'#1a1a1a',margin:'0 2px' }}/>
      <button style={zb} onClick={()=>setVp({x:0,y:0,z:1})}><Ico n="fit" s={13}/></button>
    </div>
  )
}

/* ─── Toast ────────────────────────────────────────────────── */
function Toast({ msg }) {
  if (!msg) return null
  return (
    <div style={{ position:'absolute',bottom:48,left:'50%',transform:'translateX(-50%)',background:'#111',border:'1px solid #1e1e1e',color:'#bbb',padding:'5px 14px',borderRadius:20,fontSize:11,zIndex:9999,pointerEvents:'none',fontFamily:'DM Mono,monospace',whiteSpace:'nowrap' }}>
      {msg}
    </div>
  )
}

/* ─── TopBar ───────────────────────────────────────────────── */
function TopBar({ proj, setProj, onSave, onExport, onImport, saved }) {
  const [edit, sEdit] = useState(false)
  const [h, sh] = useState(false)
  const fRef = useRef()
  return (
    <div style={{ height:44,background:'#0d0d0d',borderBottom:'1px solid #161616',display:'flex',alignItems:'center',padding:'0 14px',gap:8,flexShrink:0,zIndex:200 }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,marginRight:4 }}>
        <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
          <rect x="1" y="1" width="9" height="9" fill="white" opacity=".9" rx="1"/>
          <rect x="12" y="1" width="9" height="9" fill="white" opacity=".3" rx="1"/>
          <rect x="1" y="12" width="9" height="9" fill="white" opacity=".3" rx="1"/>
          <rect x="12" y="12" width="9" height="9" fill="white" opacity=".9" rx="1"/>
        </svg>
        <span style={{ fontSize:11,fontWeight:600,letterSpacing:'.18em',color:'#fff',fontFamily:'DM Mono,monospace' }}>CANVAS OS</span>
      </div>
      <div style={{ width:1,height:20,background:'#1e1e1e' }}/>
      {edit ? (
        <input autoFocus defaultValue={proj}
          style={{ background:'#111',border:'1px solid #2a2a2a',color:'#fff',fontSize:13,padding:'3px 8px',borderRadius:4,outline:'none',minWidth:140 }}
          onBlur={e=>{setProj(e.target.value||proj);sEdit(false)}}
          onKeyDown={e=>{if(e.key==='Enter'){setProj(e.target.value||proj);sEdit(false)}if(e.key==='Escape')sEdit(false)}}/>
      ) : (
        <button onMouseEnter={()=>sh(true)} onMouseLeave={()=>sh(false)} onClick={()=>sEdit(true)}
          style={{ display:'flex',alignItems:'center',gap:5,background:h?'#111':'transparent',border:`1px solid ${h?'#1e1e1e':'transparent'}`,color:'#bbb',fontSize:13,padding:'3px 8px',borderRadius:4,cursor:'pointer',fontWeight:500 }}>
          {proj}<span style={{opacity:.4}}><Ico n="edit" s={11}/></span>
        </button>
      )}
      <div style={{ flex:1 }}/>
      <div style={{ fontSize:10,color:'#1e1e1e',fontFamily:'DM Mono,monospace',display:'flex',alignItems:'center',gap:5 }}>
        <span style={{ width:5,height:5,borderRadius:'50%',background:saved?'#1e3a1e':'#3a2a0e',display:'inline-block' }}/>
        {saved?'Sauvegardé':'Sauvegarde…'}
      </div>
      <div style={{ width:1,height:20,background:'#1e1e1e' }}/>
      <div style={{ display:'flex',alignItems:'center',gap:2 }}>
        <IBtn icon="save" label="Sauvegarder (Ctrl+S)" onClick={onSave}/>
        <IBtn icon="dl"   label="Exporter JSON"         onClick={onExport}/>
        <IBtn icon="ul"   label="Importer JSON"         onClick={()=>fRef.current.click()}/>
        <input ref={fRef} type="file" accept=".json" style={{display:'none'}} onChange={onImport}/>
        <div style={{ width:1,height:16,background:'#1a1a1a',margin:'0 4px' }}/>
        <Tip label="rommentgrame">
          <div style={{ width:28,height:28,borderRadius:'50%',background:'#141414',border:'1px solid #222',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#555',fontFamily:'DM Mono,monospace',fontWeight:600,cursor:'default' }}>R</div>
        </Tip>
      </div>
    </div>
  )
}

/* ─── App ──────────────────────────────────────────────────── */
export default function App() {
  const [proj,     setProj]     = useState('Untitled Project')
  const [pages,    setPages]    = useState(() => { const d=load(); return d?.pages?.length ? d.pages : [mkPage('Main Canvas')] })
  const [activeId, setActiveId] = useState(() => { const d=load(); return d?.pages?.[0]?.id || null })
  const [editId,   setEditId]   = useState(null)
  const [tool,     setTool]     = useState('select')
  const [tab,      setTab]      = useState('tools')
  const [selIds,   setSelIds]   = useState([])
  const [connFrom, setConnFrom] = useState(null)
  const [vp,       setVp]       = useState({ x:0, y:0, z:1 })
  const [ctx,      setCtx]      = useState(null)
  const [toast,    setToast]    = useState(null)
  const [saved,    setSaved]    = useState(true)

  const cvRef  = useRef()
  const panRef = useRef()

  // fix activeId on first load
  useEffect(() => {
    if (!activeId && pages.length) setActiveId(pages[0].id)
  }, [])

  // auto-save
  useEffect(() => {
    setSaved(false)
    const t = setTimeout(() => { save({ proj, pages }); setSaved(true) }, 1500)
    return () => clearTimeout(t)
  }, [proj, pages])

  const notify = useCallback(m => { setToast(m); setTimeout(()=>setToast(null),1800) }, [])

  const activePage = pages.find(p => p.id === activeId) || pages[0]
  const nodes      = activePage?.nodes       || []
  const conns      = activePage?.connections || []

  const upPage = (id, fn) => setPages(prev => prev.map(p => p.id===id ? {...p,...fn(p)} : p))
  const setNodes = fn => upPage(activeId, p => ({ nodes: typeof fn==='function' ? fn(p.nodes) : fn }))
  const setConns = fn => upPage(activeId, p => ({ connections: typeof fn==='function' ? fn(p.connections) : fn }))

  // wheel zoom
  useEffect(() => {
    const el = cvRef.current; if (!el) return
    const h = e => {
      e.preventDefault()
      const d = e.deltaY>0 ? .9 : 1.1
      setVp(v => {
        const nz = Math.min(Math.max(+(v.z*d).toFixed(2),.08),5)
        const r = el.getBoundingClientRect()
        const mx=e.clientX-r.left, my=e.clientY-r.top
        return { z:nz, x:mx-(mx-v.x)*(nz/v.z), y:my-(my-v.y)*(nz/v.z) }
      })
    }
    el.addEventListener('wheel',h,{passive:false})
    return ()=>el.removeEventListener('wheel',h)
  }, [])

  const handleCanvasMD = e => {
    if (e.button===1||tool==='hand') {
      panRef.current={sx:e.clientX-vp.x,sy:e.clientY-vp.y}
      const mv=e2=>{if(panRef.current)setVp(v=>({...v,x:e2.clientX-panRef.current.sx,y:e2.clientY-panRef.current.sy}))}
      const up=()=>{panRef.current=null;removeEventListener('mousemove',mv);removeEventListener('mouseup',up)}
      addEventListener('mousemove',mv); addEventListener('mouseup',up)
      return
    }
    if (!e.target.classList.contains('cvbg')) return
    if (connFrom) { setConnFrom(null); return }
    if (tool==='select') { setSelIds([]); return }
    if (NODE_META[tool]) {
      const r=cvRef.current.getBoundingClientRect()
      const x=(e.clientX-r.left-vp.x)/vp.z - NODE_META[tool].w/2
      const y=(e.clientY-r.top-vp.y)/vp.z  - NODE_META[tool].h/2
      const nd=mkNode(tool,x,y)
      setNodes(p=>[...p,nd]); setSelIds([nd.id]); setTool('select')
    }
  }

  const handleCtx = e => {
    e.preventDefault()
    const r=cvRef.current?.getBoundingClientRect()
    setCtx({x:e.clientX-(r?.left||0), y:e.clientY-(r?.top||0), px:e.clientX, py:e.clientY})
  }

  // node ops
  const dragNode  = (id,dx,dy) => setNodes(p=>p.map(n=>n.id===id?{...n,x:n.x+dx/vp.z,y:n.y+dy/vp.z}:n))
  const resNode   = (id,dw,dh) => setNodes(p=>p.map(n=>n.id===id?{...n,w:Math.max(100,n.w+dw/vp.z),h:Math.max(60,n.h+dh/vp.z)}:n))
  const updNode   = (id,u)     => setNodes(p=>p.map(n=>n.id===id?{...n,...u}:n))
  const delNode   = id         => { setNodes(p=>p.filter(n=>n.id!==id)); setConns(p=>p.filter(c=>c.from!==id&&c.to!==id)); setSelIds(p=>p.filter(i=>i!==id)) }
  const dupNode   = id         => { const n=nodes.find(x=>x.id===id); if(n){const nn={...n,id:uid(),x:n.x+24,y:n.y+24};setNodes(p=>[...p,nn]);setSelIds([nn.id])} }

  // connections
  const portDown  = id => setConnFrom(prev=>prev?null:id)
  const connEnd   = id => {
    if (connFrom && connFrom!==id && !conns.some(c=>c.from===connFrom&&c.to===id)) {
      setConns(p=>[...p,{id:uid(),from:connFrom,to:id}])
    }
    setConnFrom(null)
  }

  // add helpers
  const addCenter = type => {
    const r=cvRef.current?.getBoundingClientRect()
    const x=((r?r.width/2:400)-vp.x)/vp.z-NODE_META[type].w/2
    const y=((r?r.height/2:300)-vp.y)/vp.z-NODE_META[type].h/2
    const nd=mkNode(type,x,y); setNodes(p=>[...p,nd]); setSelIds([nd.id])
  }
  const addAt = (type,px,py) => {
    const r=cvRef.current?.getBoundingClientRect(); if(!r)return
    const x=(px-r.left-vp.x)/vp.z-NODE_META[type].w/2
    const y=(py-r.top-vp.y)/vp.z-NODE_META[type].h/2
    const nd=mkNode(type,x,y); setNodes(p=>[...p,nd]); setSelIds([nd.id])
  }

  // pages
  const addPage  = ()    => { const p=mkPage(`Canvas ${pages.length+1}`); setPages(p2=>[...p2,p]); setActiveId(p.id); setSelIds([]) }
  const delPage  = id    => { if(pages.length===1)return; const i=pages.findIndex(p=>p.id===id); setPages(p=>p.filter(x=>x.id!==id)); setActiveId(pages[i>0?i-1:1]?.id) }
  const dupPage  = id    => { const p=pages.find(x=>x.id===id); if(!p)return; const np={...p,id:pid(),name:p.name+' (copie)',nodes:p.nodes.map(n=>({...n,id:uid()})),connections:[]}; setPages(p2=>[...p2,np]); setActiveId(np.id) }
  const renamePg = (id,name) => { setPages(p=>p.map(x=>x.id===id?{...x,name}:x)); setEditId(null) }

  // export / import
  const onExport = () => {
    const blob=new Blob([JSON.stringify({proj,pages},null,2)],{type:'application/json'})
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${proj}.json`; a.click()
    notify('Exporté ✓')
  }
  const onImport = e => {
    const f=e.target.files?.[0]; if(!f)return
    const r=new FileReader()
    r.onload=ev=>{ try{ const d=JSON.parse(ev.target.result); if(d.pages){setProj(d.proj||'Importé');setPages(d.pages);setActiveId(d.pages[0].id);notify('Importé ✓')} else notify('Fichier invalide') }catch{notify('Erreur parsing')} }
    r.readAsText(f)
  }
  const onSave = () => { save({proj,pages}); setSaved(true); notify('Sauvegardé ✓') }

  // keyboard
  useEffect(() => {
    const h = e => {
      const tag=document.activeElement?.tagName
      if(tag==='INPUT'||tag==='TEXTAREA') return
      if(e.key==='Escape'){setSelIds([]);setConnFrom(null);setCtx(null)}
      if((e.key==='Delete'||e.key==='Backspace')&&selIds.length) selIds.forEach(id=>delNode(id))
      if(!e.ctrlKey&&!e.metaKey){
        const map={v:'select',h:'hand',t:'text',n:'note',i:'image',s:'shape',d:'table',l:'link',m:'mindmap',c:'connect'}
        if(map[e.key]) setTool(map[e.key])
      }
      if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();onSave()}
    }
    window.addEventListener('keydown',h)
    return ()=>window.removeEventListener('keydown',h)
  }, [selIds])

  const selNode = nodes.find(n=>n.id===selIds[0])
  const cursor = tool==='hand'?'grab':connFrom?'crosshair':tool==='select'?'default':'crosshair'

  return (
    <div style={{ display:'flex',flexDirection:'column',width:'100%',height:'100%',background:'#080808',color:'#e0e0e0',fontFamily:"'DM Sans',system-ui,sans-serif",fontSize:13,overflow:'hidden' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        input,textarea,button{font-family:inherit}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#0a0a0a}
        ::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:2px}
      `}</style>

      <TopBar proj={proj} setProj={setProj} onSave={onSave} onExport={onExport} onImport={onImport} saved={saved}/>

      <div style={{ flex:1,display:'flex',overflow:'hidden',position:'relative',minHeight:0 }}>
        <Sidebar tool={tool} setTool={setTool} tab={tab} setTab={setTab} nodes={nodes} selIds={selIds} setSelIds={setSelIds} onAddCenter={addCenter}/>

        {/* canvas */}
        <div ref={cvRef} className="cvbg"
          style={{ flex:1,position:'relative',overflow:'hidden',background:'#080808',cursor }}
          onMouseDown={handleCanvasMD}
          onContextMenu={handleCtx}>

          <Grid vp={vp}/>

          <div className="cvbg" style={{ position:'absolute',top:0,left:0,transformOrigin:'0 0',transform:`translate(${vp.x}px,${vp.y}px) scale(${vp.z})`,willChange:'transform' }}>
            <Conns nodes={nodes} conns={conns} selIds={selIds} onDel={id=>setConns(p=>p.filter(c=>c.id!==id))}/>
            {nodes.map(n=>(
              <Node key={n.id} n={n}
                sel={selIds.includes(n.id)}
                tool={tool} connFrom={connFrom}
                onSel={e=>{ if(e.shiftKey) setSelIds(p=>p.includes(n.id)?p.filter(i=>i!==n.id):[...p,n.id]); else setSelIds([n.id]) }}
                onDrag={dragNode} onResize={resNode} onUpdate={updNode}
                onDel={()=>delNode(n.id)} onDup={()=>dupNode(n.id)}
                onPortDown={id=>connFrom?connEnd(id):portDown(id)}
                onConnEnd={connEnd}/>
            ))}
          </div>

          {nodes.length===0 && <Empty/>}
          <ZBar vp={vp} setVp={setVp}/>

          {tool!=='select'&&tool!=='hand' && (
            <div style={{ position:'absolute',top:12,left:'50%',transform:'translateX(-50%)',background:'#0d0d0d',border:'1px solid #1e1e1e',color:'#444',fontSize:10,padding:'3px 12px',borderRadius:20,fontFamily:'DM Mono,monospace',letterSpacing:'.1em',pointerEvents:'none' }}>
              {(INSERTS.find(t=>t.id===tool)||{label:tool}).label.toUpperCase()} — clic pour placer
            </div>
          )}
          {connFrom && (
            <div style={{ position:'absolute',top:12,left:'50%',transform:'translateX(-50%)',background:'#0d1020',border:'1px solid #2020aa',color:'#5555dd',fontSize:10,padding:'3px 12px',borderRadius:20,fontFamily:'DM Mono,monospace',letterSpacing:'.1em',pointerEvents:'none' }}>
              CONNEXION — cliquer un autre nœud
            </div>
          )}
          {ctx && (
            <CtxMenu x={ctx.x} y={ctx.y}
              onClose={()=>setCtx(null)}
              onAdd={type=>addAt(type,ctx.px,ctx.py)}
              onFit={()=>setVp({x:0,y:0,z:1})}
              onClear={()=>{setNodes([]);setConns([]);setSelIds([])}}/>
          )}
          <Toast msg={toast}/>
        </div>

        {selIds.length===1&&selNode && (
          <RPanel node={selNode} onUpdate={updNode}
            onDel={()=>delNode(selNode.id)}
            onDup={()=>dupNode(selNode.id)}
            onClose={()=>setSelIds([])}/>
        )}
      </div>

      <BottomBar pages={pages} activeId={activeId} editId={editId}
        setActive={id=>{setActiveId(id);setSelIds([])}}
        onAdd={addPage} onDel={delPage} onDup={dupPage}
        onRename={setEditId} onRenameDone={renamePg}
        nc={nodes.length} cc={conns.length} zoom={vp.z}/>
    </div>
  )
}
