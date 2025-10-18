import React from 'react'
import { Block, Category, Command, CommandArg } from '../types'

interface SidebarProps {
  categories: { [key: string]: Category }
  expandedCategories: Set<string>
  toggleCategory: (name: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  handleDragStart: (e: React.DragEvent, type: string, data: any) => void
  canvasBlocks: Block[]
}

const Sidebar: React.FC<SidebarProps> = ({
  categories,
  expandedCategories,
  toggleCategory,
  searchTerm,
  setSearchTerm,
  handleDragStart,
  canvasBlocks
}) => {
  const filteredCategories = Object.entries(categories).filter(([categoryName, categoryData]) => {
    if (!searchTerm) return true
    return Object.entries(categoryData.commands).some(([cmdName, cmdData]) =>
      cmdName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmdData.desc.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Check if argument can be added based on ordering rules
  const canAddArgument = (commandName: string, arg: CommandArg): { canAdd: boolean, reason: string } => {
    // First check if parent command exists
    const parentExists = canvasBlocks.some(block => block.type === 'command' && block.command === commandName)
    if (!parentExists) {
      return { canAdd: false, reason: 'Add parent command first' }
    }

    // Get all arguments for this command that are already on canvas
    const commandArgs = canvasBlocks.filter(b => b.type === 'arg' && b.command === commandName)
    
    // Check if this exact argument is already added
    const alreadyAdded = commandArgs.some(b => b.arg === arg.name)
    if (alreadyAdded) {
      return { canAdd: false, reason: 'Already added' }
    }

    // Get the command definition to check argument order
    const commandDef = Object.values(categories)
      .flatMap(cat => Object.entries(cat.commands))
      .find(([name]) => name === commandName)?.[1]
    
    if (!commandDef) return { canAdd: false, reason: 'Command not found' }

    // Find if any positional argument (non-flag) has been added
    const hasPositionalArg = commandArgs.some(b => {
      return b.arg && !b.arg.startsWith('-')
    })

    // If this is a flag and a positional arg already exists, can't add
    if (arg.name.startsWith('-') && hasPositionalArg) {
      return { canAdd: false, reason: 'Flags must come before positional arguments' }
    }

    // Find the index of current argument in the command definition
    const currentArgIndex = commandDef.args.findIndex(a => a.name === arg.name)
    
    // Check if any argument that should come before this one is missing
    for (let i = 0; i < currentArgIndex; i++) {
      const requiredArg = commandDef.args[i]
      const isAdded = commandArgs.some(b => b.arg === requiredArg.name)
      
      // If it's a positional argument (non-flag) and not added, it's required first
      if (!requiredArg.name.startsWith('-') && !isAdded) {
        // Skip this check for flags before positional args
        continue
      }
    }

    return { canAdd: true, reason: '' }
  }

  // Get visual indicator for argument state
  const getArgState = (commandName: string, arg: CommandArg) => {
    const { canAdd, reason } = canAddArgument(commandName, arg)
    
    if (!canAdd) {
      return {
        locked: true,
        opacity: 0.5,
        cursor: 'not-allowed',
        color: '#6272a4',
        background: 'rgba(58, 61, 80, 0.2)',
        icon: '🔒',
        tooltip: reason
      }
    }

    return {
      locked: false,
      opacity: 1,
      cursor: 'grab',
      color: '#d8dee9',
      background: 'rgba(58, 61, 80, 0.5)',
      icon: '',
      tooltip: ''
    }
  }

  return (
    <div style={{
      width: '30%',
      background: 'rgba(40, 42, 54, 0.95)',
      borderRadius: '16px',
      padding: '20px',
      overflowY: 'auto',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid rgba(98, 114, 164, 0.3)'
      }}>
        <h2 style={{ color: '#66d9ef', fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          📋 Command Library
        </h2>
        <input
          type="text"
          placeholder="Search commands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'rgba(68, 71, 90, 0.5)',
            border: '2px solid rgba(98, 114, 164, 0.3)',
            borderRadius: '12px',
            color: '#e0e0e0',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      </div>

      {filteredCategories.map(([categoryName, categoryData]) => {
        const isExpanded = expandedCategories.has(categoryName) || searchTerm !== ''

        return (
          <div key={categoryName} style={{ marginBottom: '12px' }}>
            <div
              onClick={() => toggleCategory(categoryName)}
              style={{
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #5e81ac 0%, #4c7399 100%)',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(94, 129, 172, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              <span style={{
                fontSize: '18px',
                transition: 'transform 0.3s ease',
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
              }}>▶</span>
              <span>{categoryData.icon} {categoryName}</span>
            </div>

            {isExpanded && (
              <div style={{ marginTop: '8px' }}>
                {Object.entries(categoryData.commands)
                  .filter(([cmdName, cmdData]) =>
                    !searchTerm ||
                    cmdName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    cmdData.desc.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(([cmdName, cmdData]) => (
                    <div key={cmdName}>
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'command', { command: cmdName })}
                        style={{
                          padding: '10px 16px',
                          margin: '4px 0 4px 12px',
                          background: 'rgba(68, 71, 90, 0.4)',
                          borderRadius: '10px',
                          cursor: 'grab',
                          borderLeft: '3px solid transparent',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ fontWeight: 600, color: '#a3be8c', marginBottom: '4px' }}>
                          {cmdName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#8890a0', lineHeight: 1.4 }}>
                          {cmdData.desc}
                        </div>
                      </div>

                      {cmdData.args.length > 0 && (
                        <div style={{ marginLeft: '32px', marginTop: '6px' }}>
                          {cmdData.args.map((arg, idx) => {
                            const argState = getArgState(cmdName, arg)

                            return (
                              <div
                                key={idx}
                                draggable={!argState.locked}
                                onDragStart={!argState.locked ? (e) => handleDragStart(e, 'arg', {
                                  command: cmdName,
                                  arg: arg.name,
                                  hasInput: arg.hasInput,
                                  placeholder: arg.placeholder
                                }) : undefined}
                                title={argState.tooltip}
                                style={{
                                  padding: '8px 12px',
                                  margin: '3px 0',
                                  background: argState.background,
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  color: argState.color,
                                  cursor: argState.cursor,
                                  borderLeft: `2px solid ${argState.locked ? '#6272a4' : '#ebcb8b'}`,
                                  opacity: argState.opacity,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {argState.icon && <span style={{ fontSize: '14px' }}>{argState.icon}</span>}
                                <span>{arg.name} - {arg.desc}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Sidebar