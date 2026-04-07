import { useState, useRef } from 'react'
import { Ico, IBtn, Tip } from './ui.jsx'

export function TopBar({ proj, setProj, onSave, onExport, onImport, onUndo, onRedo, saved }) {
  const [edit, setEdit] = useState(false)
  const [h, setH] = useState(false)
  const fileRef = useRef()

  return (
    <div style={{
      height: 44, background: '#0d0d0d', borderBottom: '1px solid #161616',
      display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8,
      flexShrink: 0, zIndex: 200,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 4 }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="1" y="1" width="9" height="9" fill="white" opacity="0.9" rx="1" />
          <rect x="12" y="1" width="9" height="9" fill="white" opacity="0.35" rx="1" />
          <rect x="1" y="12" width="9" height="9" fill="white" opacity="0.35" rx="1" />
          <rect x="12" y="12" width="9" height="9" fill="white" opacity="0.9" rx="1" />
        </svg>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', color: '#fff', fontFamily: 'DM Mono,monospace' }}>
          CANVAS OS
        </span>
      </div>

      <div style={{ width: 1, height: 20, background: '#1e1e1e' }} />

      {/* Project name */}
      {edit ? (
        <input autoFocus defaultValue={proj}
          style={{ background: '#111', border: '1px solid #2a2a2a', color: '#fff', fontSize: 13, padding: '3px 8px', borderRadius: 4, outline: 'none', minWidth: 140 }}
          onBlur={e => { setProj(e.target.value || proj); setEdit(false) }}
          onKeyDown={e => {
            if (e.key === 'Enter') { setProj(e.target.value || proj); setEdit(false) }
            if (e.key === 'Escape') setEdit(false)
          }}
        />
      ) : (
        <button
          onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
          onClick={() => setEdit(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: h ? '#111' : 'transparent', border: `1px solid ${h ? '#1e1e1e' : 'transparent'}`, color: '#bbb', fontSize: 13, padding: '3px 8px', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}>
          {proj}
          <span style={{ opacity: 0.4, fontSize: 10 }}><Ico n="edit" s={11} /></span>
        </button>
      )}

      <div style={{ flex: 1 }} />

      {/* Save status */}
      <div style={{ fontSize: 10, color: '#2a2a2a', fontFamily: 'DM Mono,monospace', display: 'flex', alignItems: 'center', gap: 5 }}>
        {saved ? (
          <><span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2a4a2a', display: 'inline-block' }} />Sauvegardé</>
        ) : (
          <><span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4a3a1a', display: 'inline-block' }} />Sauvegarde…</>
        )}
      </div>
      <div style={{ width: 1, height: 20, background: '#1e1e1e' }} />

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IBtn icon="undo" label="Annuler (Ctrl+Z)" onClick={onUndo} />
        <IBtn icon="redo" label="Refaire (Ctrl+Y)" onClick={onRedo} />
        <div style={{ width: 1, height: 16, background: '#1a1a1a', margin: '0 4px' }} />
        <IBtn icon="save" label="Sauvegarder" onClick={onSave} />
        <IBtn icon="export" label="Exporter JSON" onClick={onExport} />
        <IBtn icon="share" label="Importer JSON" onClick={() => fileRef.current.click()} />
        <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={onImport} />
        <div style={{ width: 1, height: 16, background: '#1a1a1a', margin: '0 4px' }} />
        <Tip label="rommentgrame">
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#666', fontFamily: 'DM Mono,monospace', fontWeight: 600, cursor: 'pointer' }}>
            R
          </div>
        </Tip>
      </div>
    </div>
  )
}
