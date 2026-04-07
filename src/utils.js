// ── ID generators ──────────────────────────────────────────
let _id = 0
export const uid = () => `n${Date.now()}_${_id++}`
export const pid = () => `p${Date.now()}_${_id++}`

// ── Node type definitions ──────────────────────────────────
export const NODE_TYPES = {
  text:    { w: 260, h: 160, label: 'Text',      icon: 'type'    },
  note:    { w: 240, h: 200, label: 'Note',      icon: 'note'    },
  image:   { w: 300, h: 220, label: 'Image',     icon: 'image'   },
  shape:   { w: 140, h: 140, label: 'Shape',     icon: 'circle'  },
  table:   { w: 320, h: 220, label: 'Table',     icon: 'table'   },
  link:    { w: 260, h: 120, label: 'Link',      icon: 'link'    },
  mindmap: { w: 180, h: 80,  label: 'Mind Node', icon: 'mindmap' },
}

// ── Node factory ───────────────────────────────────────────
export const createNode = (type, x, y) => {
  const t = NODE_TYPES[type] || NODE_TYPES.text
  const base = {
    id: uid(), type, x, y,
    w: t.w, h: t.h,
    title: t.label,
    locked: false,
    zIndex: _id,
  }
  switch (type) {
    case 'text':    return { ...base, content: 'Double-cliquez pour éditer…', fontSize: 14 }
    case 'note':    return { ...base, content: '' }
    case 'image':   return { ...base, url: '' }
    case 'shape':   return { ...base, shape: 'circle', fill: 'none' }
    case 'table':   return { ...base, rows: [['Colonne A', 'Colonne B', 'Colonne C'], ['Cellule 1', 'Cellule 2', 'Cellule 3'], ['Donnée', 'Donnée', 'Donnée']] }
    case 'link':    return { ...base, url: '', label: 'Lien' }
    case 'mindmap': return { ...base, content: 'Idée', level: 0 }
    default:        return base
  }
}

// ── Page factory ───────────────────────────────────────────
export const createPage = (name = 'Canvas') => ({
  id: pid(),
  name,
  nodes: [],
  connections: [],
})

// ── Node color palette ─────────────────────────────────────
export const NODE_COLORS = {
  text:    { bg: '#111111', border: '#1c1c1c', acc: '#eeeeee' },
  note:    { bg: '#131310', border: '#1e1e17', acc: '#c8c050' },
  image:   { bg: '#0d1211', border: '#181e1c', acc: '#50c8a0' },
  shape:   { bg: '#110d0d', border: '#1e1515', acc: '#c87850' },
  table:   { bg: '#0d0d13', border: '#15152a', acc: '#7070e0' },
  link:    { bg: '#100d13', border: '#1a1520', acc: '#a070c0' },
  mindmap: { bg: '#0d1111', border: '#152020', acc: '#50b8b8' },
}

// ── SVG icon paths ─────────────────────────────────────────
export const ICONS = {
  cursor:   'M6 2l12 10-7 1-3 7z',
  hand:     'M9 4a2 2 0 0 1 2 2v3h2a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v4H8l-3-4V8a2 2 0 0 1 2-2V4z',
  type:     'M4 6h16M12 4v16M9 20h6',
  note:     'M3 3h18v18H3zM3 9h18M9 21V9',
  circle:   'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
  table:    'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18',
  link:     'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l2-2',
  connect:  'M18 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM9 6l6 9',
  image:    'M3 3h18v18H3zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM21 15l-5-5L5 21',
  mindmap:  'M12 12m-4 0a4 4 0 1 0 8 0 4 4 0 1 0-8 0M3 12h5M16 12h5M12 3v5M12 16v5',
  plus:     'M12 5v14M5 12h14',
  trash:    'M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6',
  copy:     'M9 9h11v11H9zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
  save:     'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8',
  export:   'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  undo:     'M3 7v6h6M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13',
  redo:     'M21 7v6h-6M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13',
  grid:     'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  layers:   'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  search:   'M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z',
  maximize: 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3',
  x:        'M18 6L6 18M6 6l12 12',
  edit:     'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z',
  share:    'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49',
  zoomIn:   'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.35-4.35M11 8v6M8 11h6',
  zoomOut:  'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.35-4.35M8 11h6',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
}

// ── Sidebar tool lists ────────────────────────────────────
export const NAV_TOOLS = [
  { id: 'select',  icon: 'cursor',  label: 'Sélection', key: 'V' },
  { id: 'hand',    icon: 'hand',    label: 'Déplacement', key: 'H' },
]

export const INSERT_TOOLS = [
  { id: 'text',    icon: 'type',    label: 'Texte',      key: 'T' },
  { id: 'note',    icon: 'note',    label: 'Note',       key: 'N' },
  { id: 'image',   icon: 'image',   label: 'Image',      key: 'I' },
  { id: 'shape',   icon: 'circle',  label: 'Forme',      key: 'S' },
  { id: 'table',   icon: 'table',   label: 'Tableau',    key: 'D' },
  { id: 'link',    icon: 'link',    label: 'Lien',       key: 'L' },
  { id: 'mindmap', icon: 'mindmap', label: 'Idée',       key: 'M' },
  { id: 'connect', icon: 'connect', label: 'Connecter',  key: 'C' },
]

// ── Storage helpers ────────────────────────────────────────
const STORAGE_KEY = 'canvos_v1'

export const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const saveToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}
