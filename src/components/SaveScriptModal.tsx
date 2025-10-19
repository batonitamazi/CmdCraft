import React, { useEffect, useState } from 'react'

interface SaveScriptModalProps {
  isOpen: boolean
  onClose: () => void
  canvasBlocks: any[]
  onSave: (name: string) => Promise<void> | void
  initialName?: string
}

const SaveScriptModal: React.FC<SaveScriptModalProps> = ({ isOpen, onClose, canvasBlocks, onSave, initialName }) => {
  const [name, setName] = useState('')

  useEffect(() => {
    if (initialName) setName(initialName)
    else setName('')
  }, [initialName, isOpen])

  if (!isOpen) return null

  const handleSave = async () => {
    if (!name.trim()) return
    await onSave(name.trim())
    setName('')
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
      zIndex: 9999
    }}>
      <div style={{
        width: 'min(720px, 92%)',
        maxWidth: '720px',
        background: '#2c2f3a',
        color: '#e6eef6',
        borderRadius: 12,
        padding: 18,
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <h3 style={{ margin: 0, marginBottom: 8 }}>{initialName ? 'Update Script' : 'Save Script'}</h3>
        <p style={{ marginTop: 0, marginBottom: 12, color: '#9aa4b2', fontSize: 13 }}>{initialName ? 'Modify and overwrite the saved script.' : 'Save the current ordered blocks so you can reuse them later.'}</p>

        <label style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>Script name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My script name"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.06)',
            background: '#23242b',
            color: '#e6eef6',
            marginBottom: 12,
            boxSizing: 'border-box'
          }}
        />

        <div style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleSave}
            style={{
              flex: '1 1 140px',
              minWidth: 120,
              padding: '10px 14px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(90deg,#66d9ef,#5fb1ff)',
              color: '#0b0f14',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {initialName ? 'Update' : 'Save'}
          </button>

          <button
            onClick={() => { setName(''); onClose() }}
            style={{
              flex: '1 1 140px',
              minWidth: 120,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'transparent',
              color: '#e6eef6',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default SaveScriptModal