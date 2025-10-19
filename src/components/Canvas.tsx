import React from 'react'
import { Block } from '../types'

interface CanvasProps {
  canvasBlocks: Block[]
  isDragOver: boolean
  setIsDragOver: (state: boolean) => void
  handleDrop: (e: React.DragEvent) => void
  updateBlockValue: (id: number, value: string) => void
  removeBlock: (id: number) => void
  clearCanvas: () => void
  onOpenSaveModal: () => void
}

const Canvas: React.FC<CanvasProps> = ({
  canvasBlocks,
  isDragOver,
  setIsDragOver,
  handleDrop,
  updateBlockValue,
  removeBlock,
  clearCanvas,
  onOpenSaveModal
}) => {
  return (
    <div style={{
      flex: '0 0 70%',
      background: 'rgba(40, 42, 54, 0.95)',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      overflow: 'auto'
    }}>
      <div style={{
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid rgba(98, 114, 164, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ color: '#66d9ef', fontSize: '20px', fontWeight: 600 }}>🎨 Visual Builder</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onOpenSaveModal}
            disabled={canvasBlocks.length === 0}
            style={{
              padding: '10px 20px',
              background: canvasBlocks.length === 0 
                ? 'rgba(102, 217, 239, 0.3)'
                : 'linear-gradient(135deg, #66d9ef 0%, #5fb1ff 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontWeight: 600,
              cursor: canvasBlocks.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: canvasBlocks.length === 0 
                ? 'none'
                : '0 4px 12px rgba(102, 217, 239, 0.3)',
              opacity: canvasBlocks.length === 0 ? 0.5 : 1
            }}
          >Save</button>
          <button
            onClick={clearCanvas}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #bf616a 0%, #a54e56 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(191, 97, 106, 0.3)'
            }}
          >Clear</button>
        </div>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        style={{
          minHeight: '400px',
          background: isDragOver
            ? 'rgba(102, 217, 239, 0.1)'
            : 'linear-gradient(135deg, rgba(68, 71, 90, 0.3) 0%, rgba(58, 61, 80, 0.3) 100%)',
          borderRadius: '12px',
          border: isDragOver
            ? '2px solid #66d9ef'
            : '2px dashed rgba(98, 114, 164, 0.3)',
          padding: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignContent: 'flex-start'
        }}
      >
        {canvasBlocks.length === 0 ? (
          <div style={{
            width: '100%',
            textAlign: 'center',
            color: '#6272a4',
            fontSize: '16px',
            padding: '60px 20px'
          }}>
            Drag and drop commands here to build your shell script
          </div>
        ) : (
          canvasBlocks.map(block => (
            <div
              key={block.id}
              style={{
                background: block.type === 'command'
                  ? 'linear-gradient(135deg, #a3be8c 0%, #8da872 100%)'
                  : 'linear-gradient(135deg, #ebcb8b 0%, #d4b376 100%)',
                padding: '14px 18px',
                borderRadius: '12px',
                color: block.type === 'arg' ? '#2e3440' : 'white',
                fontWeight: 600,
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {block.hasInput ? (
                <>
                  <span>{block.arg}:</span>
                  <input
                    type="text"
                    placeholder={block.placeholder}
                    value={block.value}
                    onChange={(e) => updateBlockValue(block.id, e.target.value)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      color: '#2e3440',
                      fontSize: '13px',
                      minWidth: '80px',
                      fontFamily: "'Courier New', monospace"
                    }}
                  />
                </>
              ) : <span>{block.value}</span>}
              <button
                onClick={() => removeBlock(block.id)}
                style={{
                  background: 'rgba(191, 97, 106, 0.9)',
                  border: 'none',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '6px'
                }}
              >×</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Canvas