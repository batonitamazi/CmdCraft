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
    const parts: string[] = []
    canvasBlocks.forEach(block => {
      if (block.type === 'command') parts.push(block.command)
      else if (block.type === 'arg') {
        if (block.hasInput && block.value) parts.push(block.arg!.startsWith('-') ? `${block.arg} ${block.value}` : block.value)
        else if (!block.hasInput) parts.push(block.arg!)
      }
    })
    return parts.join(' ')
  }

  const addCommandBlock = (commandName: string) => {
    setCanvasBlocks(prev => [...prev, { id: blockIdCounter, type: 'command', command: commandName, value: commandName }])
    setBlockIdCounter(prev => prev + 1)
  }

  const addArgBlock = (commandName: string, argName: string, hasInput: boolean, placeholder?: string) => {
    setCanvasBlocks(prev => [...prev, { id: blockIdCounter, type: 'arg', command: commandName, arg: argName, hasInput, placeholder, value: hasInput ? '' : argName }])
    setBlockIdCounter(prev => prev + 1)
  }

  const removeBlock = (id: number) => setCanvasBlocks(prev => prev.filter(b => b.id !== id))
  const updateBlockValue = (id: number, value: string) => setCanvasBlocks(prev => prev.map(b => b.id === id ? { ...b, value } : b))
  const clearCanvas = () => { setCanvasBlocks([]); setOutputLines(['Ready to execute commands...']) }
  const executeCommand = () => { const command = generateCommand(); if (!command) return; setOutputLines(prev => [...prev, `$ ${command}`, 'Command would be executed here (demo only)']) }
  const toggleCategory = (name: string) => { setExpandedCategories(prev => { const newSet = new Set(prev); newSet.has(name) ? newSet.delete(name) : newSet.add(name); return newSet }) }

  const handleDragStart = (e: React.DragEvent, type: string, data: any) => { e.dataTransfer.effectAllowed = 'copy'; e.dataTransfer.setData('application/json', JSON.stringify({ type, ...data })) }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false)
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))
      if (data.type === 'command') addCommandBlock(data.command)
      else if (data.type === 'arg') addArgBlock(data.command, data.arg, data.hasInput, data.placeholder)
    } catch (err) { console.error('Error parsing drag data:', err) }
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
      />
      <div style={{ width: '70%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Canvas canvasBlocks={canvasBlocks} isDragOver={isDragOver} setIsDragOver={setIsDragOver} handleDrop={handleDrop} updateBlockValue={updateBlockValue} removeBlock={removeBlock} clearCanvas={clearCanvas} />
        <Output outputLines={outputLines} commandPreview={commandPreview} executeCommand={executeCommand} />
      </div>
    </div>
  )
}

export default App
