import React from 'react'

interface OutputProps {
  outputLines: string[]
  commandPreview: string
  executeCommand: () => void
}

const Output: React.FC<OutputProps> = ({ outputLines, commandPreview, executeCommand }) => (
  <div style={{
    flex: '0 0 calc(30% - 12px)',
    background: 'rgba(40,42,54,0.95)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column'
  }}>
    <div style={{ marginBottom: '15px', paddingBottom: '12px', borderBottom: '2px solid rgba(98,114,164,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2 style={{ color: '#66d9ef', fontSize: '18px', fontWeight: 600 }}>⚡ Command Preview</h2>
      <button
        onClick={executeCommand}
        disabled={!commandPreview}
        style={{
          padding: '10px 24px',
          background: commandPreview ? 'linear-gradient(135deg, #a3be8c 0%, #8da872 100%)' : 'rgba(163,190,140,0.3)',
          border: 'none',
          borderRadius: '12px',
          color: commandPreview ? '#2e3440' : '#8890a0',
          fontWeight: 600,
          cursor: commandPreview ? 'pointer' : 'not-allowed',
          boxShadow: commandPreview ? '0 4px 12px rgba(163,190,140,0.3)' : 'none',
          fontSize: '14px'
        }}
      >Execute</button>
    </div>

    <div style={{ background: 'rgba(30,30,46,0.8)', padding: '16px', borderRadius: '10px', fontFamily: "'Courier New', monospace", color: '#a3be8c', marginBottom: '12px', border: '1px solid rgba(98,114,164,0.3)', fontSize: '14px', wordBreak: 'break-all', minHeight: '50px' }}>
      {commandPreview || '# Your command will appear here'}
    </div>

    <div style={{ flex: 1, background: 'rgba(30,30,46,0.8)', padding: '16px', borderRadius: '10px', fontFamily: "'Courier New', monospace", fontSize: '13px', color: '#e0e0e0', overflowY: 'auto', border: '1px solid rgba(98,114,164,0.3)' }}>
      {outputLines.map((line, idx) => <div key={idx} style={{ marginBottom: '6px', lineHeight: 1.5 }}>{line}</div>)}
    </div>
  </div>
)

export default Output