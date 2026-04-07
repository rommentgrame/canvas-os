export function Connections({ nodes, conns, selIds, onDelConn }) {
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
      <defs>
        <marker id="arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#2a2a2a" />
        </marker>
        <marker id="arrsel" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#555" />
        </marker>
      </defs>
      {conns.map(c => {
        const a = nodes.find(n => n.id === c.from)
        const b = nodes.find(n => n.id === c.to)
        if (!a || !b) return null
        const ax = a.x + a.w / 2, ay = a.y + a.h / 2
        const bx = b.x + b.w / 2, by = b.y + b.h / 2
        const sel = selIds.includes(a.id) || selIds.includes(b.id)
        const mx = (ax + bx) / 2
        return (
          <path key={c.id}
            d={`M${ax},${ay} Q${mx},${ay} ${bx},${by}`}
            fill="none"
            stroke={sel ? '#333' : '#1a1a1a'}
            strokeWidth={sel ? 2 : 1.5}
            strokeDasharray="6,4"
            markerEnd={`url(#${sel ? 'arrsel' : 'arr'})`}
            style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
            onClick={e => { e.stopPropagation(); onDelConn(c.id) }}
          />
        )
      })}
    </svg>
  )
}
