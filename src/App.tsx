import React, { useState } from 'react'
import './App.css'
import { commandsData } from './data/commandsData'
import { Block } from './types'
import Sidebar from './components/Sidebar'
import Canvas from './components/Canvas'
import Output from './components/Output'

function App() {
  const [canvasBlocks, setCanvasBlocks] = useState<Block[]>([])
  const [blockIdCounter, setBlockIdCounter] = useState(0)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [outputLines, setOutputLines] = useState<string[]>(['Ready to execute commands...'])

  const generateCommand = () => {
    if (canvasBlocks.length === 0) return ''

    // group blocks by groupId
    const groups: Record<number, Block[]> = {}
    canvasBlocks.forEach(block => {
      if (!groups[block.groupId]) groups[block.groupId] = []
      groups[block.groupId].push(block)
    })

    const commands = Object.values(groups).map(blocks => {
      const parts: string[] = []
      blocks.forEach(block => {
        if (block.type === 'command') parts.push(block.command)
        else if (block.type === 'arg') {
          if (block.hasInput && block.value) {
            if (!block.arg!.startsWith('-')) parts.push(block.value)
            else parts.push(`${block.arg} ${block.value}`)
          } else if (!block.hasInput) parts.push(block.arg!)
        }
      })
      return parts.join(' ')
    })

    return commands.join(' && ') // shell chaining
  }

  const addCommandBlock = (commandName: string) => {
    const newGroupId = blockIdCounter // unique id per command
    const block: Block = {
      id: blockIdCounter,
      type: 'command',
      command: commandName,
      value: commandName,
      groupId: newGroupId
    }
    
    setCanvasBlocks(prev => [...prev, block])
    setBlockIdCounter(prev => prev + 1)
  }

  const addArgBlock = (commandName: string, argName: string, hasInput: boolean, placeholder?: string) => {
    const lastCommandBlock = [...canvasBlocks].reverse().find(b => b.type === 'command')
    const groupId = lastCommandBlock ? lastCommandBlock.groupId : blockIdCounter

    const block: Block = {
      id: blockIdCounter,
      type: 'arg',
      command: commandName,
      arg: argName,
      hasInput: hasInput,
      placeholder: placeholder,
      groupId: groupId,
      value: hasInput ? '' : argName
    }
    
    setCanvasBlocks(prev => [...prev, block])
    setBlockIdCounter(prev => prev + 1)
  }

  const removeBlock = (id: number) => setCanvasBlocks(prev => prev.filter(b => b.id !== id))
  const updateBlockValue = (id: number, value: string) => setCanvasBlocks(prev => prev.map(b => b.id === id ? { ...b, value } : b))
  const clearCanvas = () => { setCanvasBlocks([]); setOutputLines(['Ready to execute commands...']) }
  const executeCommand = () => { const command = generateCommand(); if (!command) return; setOutputLines(prev => [...prev, `$ ${command}`, 'Command would be executed here (demo only)']) }
  const toggleCategory = (name: string) => { setExpandedCategories(prev => { const newSet = new Set(prev); newSet.has(name) ? newSet.delete(name) : newSet.add(name); return newSet }) }

  const handleDragStart = (e: React.DragEvent, type: string, data: any) => { e.dataTransfer.effectAllowed = 'copy'; e.dataTransfer.setData('application/json', JSON.stringify({ type, ...data })) }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))
      
      if (data.type === 'command') {
        addCommandBlock(data.command)
      } else if (data.type === 'arg') {
        addArgBlock(data.command, data.arg, data.hasInput, data.placeholder)
      }
    } catch (error) {
      console.error('Error parsing drag data:', error)
    }
  }

  

  const commandPreview = generateCommand()

  return (
    <div style={{ display: 'flex', height: '100vh', padding: '12px', gap: '12px', background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%)', color: '#e0e0e0', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <Sidebar
        categories={commandsData}
        expandedCategories={expandedCategories}
        toggleCategory={toggleCategory}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleDragStart={handleDragStart}
        canvasBlocks={canvasBlocks}
      />
      <div style={{ width: '70%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Canvas canvasBlocks={canvasBlocks} isDragOver={isDragOver} setIsDragOver={setIsDragOver} handleDrop={handleDrop} updateBlockValue={updateBlockValue} removeBlock={removeBlock} clearCanvas={clearCanvas} />
        <Output outputLines={outputLines} commandPreview={commandPreview} executeCommand={executeCommand} />
      </div>
    </div>
  )
}

export default App
