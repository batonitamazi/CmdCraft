import React from 'react'
import { CommandArg, Command } from '../types'

interface CommandItemProps {
  commandName: string
  commandData: Command
  handleDragStart: (e: React.DragEvent, type: string, data: any) => void
}

const CommandItem: React.FC<CommandItemProps> = ({ commandName, commandData, handleDragStart }) => (
  <div>
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, 'command', { command: commandName })}
      style={{
        padding: '10px 16px',
        margin: '4px 0 4px 12px',
        background: 'rgba(68,71,90,0.4)',
        borderRadius: '10px',
        cursor: 'grab',
        borderLeft: '3px solid transparent',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ fontWeight: 600, color: '#a3be8c', marginBottom: '4px' }}>{commandName}</div>
      <div style={{ fontSize: '12px', color: '#8890a0', lineHeight: 1.4 }}>{commandData.desc}</div>
    </div>

    {commandData.args.length > 0 && (
      <div style={{ marginLeft: '32px', marginTop: '6px' }}>
        {commandData.args.map((arg: CommandArg, idx: number) => (
          <div
            key={idx}
            draggable
            onDragStart={(e) => handleDragStart(e, 'arg', {
              command: commandName,
              arg: arg.name,
              hasInput: arg.hasInput,
              placeholder: arg.placeholder
            })}
            style={{
              padding: '8px 12px',
              margin: '3px 0',
              background: 'rgba(58, 61, 80, 0.5)',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#d8dee9',
              cursor: 'grab',
              borderLeft: '2px solid #ebcb8b'
            }}
          >
            {arg.name} - {arg.desc}
          </div>
        ))}
      </div>
    )}
  </div>
)

export default CommandItem
