import React from 'react'
import { Category, Block } from '../types'
import CommandItem from './CommandItem'

interface SidebarProps {
  categories: { [key: string]: Category }
  expandedCategories: Set<string>
  toggleCategory: (name: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  handleDragStart: (e: React.DragEvent, type: string, data: any) => void
}

const Sidebar: React.FC<SidebarProps> = ({
  categories,
  expandedCategories,
  toggleCategory,
  searchTerm,
  setSearchTerm,
  handleDragStart
}) => {
  const filteredCategories = Object.entries(categories).filter(([name, cat]) => {
    if (!searchTerm) return true
    return Object.entries(cat.commands).some(([cmdName, cmdData]) =>
      cmdName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmdData.desc.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div style={{
      width: '30%',
      background: 'rgba(40, 42, 54, 0.95)',
      borderRadius: '16px',
      padding: '20px',
      overflowY: 'auto',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid rgba(98,114,164,0.3)' }}>
        <h2 style={{ color: '#66d9ef', fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>📋 Command Library</h2>
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
                boxShadow: '0 4px 12px rgba(94,129,172,0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              <span style={{ fontSize: '18px', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▶</span>
              <span>{categoryData.icon} {categoryName}</span>
            </div>

            {isExpanded && (
              <div style={{ marginTop: '8px' }}>
                {Object.entries(categoryData.commands)
                  .filter(([cmdName, cmdData]) =>
                    !searchTerm || cmdName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    cmdData.desc.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(([cmdName, cmdData]) => (
                    <CommandItem key={cmdName} commandName={cmdName} commandData={cmdData} handleDragStart={handleDragStart} />
                  ))
                }
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Sidebar
