import React, { useEffect, useState } from 'react'
import './App.css'
import { commandsData } from './data/commandsData'
import { Block } from './types'
import Sidebar from './components/Sidebar'
import Canvas from './components/Canvas'
import Output from './components/Output'
import SaveScriptModal from './components/SaveScriptModal'

function App() {
  const [canvasBlocks, setCanvasBlocks] = useState<Block[]>([])
  const [blockIdCounter, setBlockIdCounter] = useState(0)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [outputLines, setOutputLines] = useState<string[]>(['Ready to execute commands...'])
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [customScripts, setCustomScripts] = useState<{ name: string; blocks: Block[]; createdAt: string }[]>([])
  const [editingScriptName, setEditingScriptName] = useState<string | null>(null)

  // load saved scripts on mount (prefer preload API, fallback to localStorage)
  useEffect(() => {
    const api = (window as any).api || (window as any).electronAPI
    if (api && typeof api.getCustomScripts === 'function') {
      api.getCustomScripts().then((list: any[]) => {
        if (Array.isArray(list)) setCustomScripts(list)
      }).catch(() => {
        const existing = JSON.parse(localStorage.getItem('customScripts') || '[]')
        setCustomScripts(existing)
      })
    } else {
      const existing = JSON.parse(localStorage.getItem('customScripts') || '[]')
      setCustomScripts(existing)
    }
  }, [])

  // persist full customScripts list (used when deleting/updating)
  const persistCustomScripts = async (list: { name: string; blocks: Block[]; createdAt: string }[]) => {
    const api = (window as any).api || (window as any).electronAPI
    try {
      if (api && typeof api.saveCustomScriptsList === 'function') {
        await api.saveCustomScriptsList(list)
      } else {
        localStorage.setItem('customScripts', JSON.stringify(list))
      }
    } catch (err) {
      console.error('persistCustomScripts error', err)
      localStorage.setItem('customScripts', JSON.stringify(list))
    }
  }

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
    // Prevent adding a new command if the most recent command requires args but has no args added yet
    const lastCommandBlock = [...canvasBlocks].reverse().find(b => b.type === 'command')
    if (lastCommandBlock) {
      const commandDef = Object.values(commandsData)
        .flatMap(cat => Object.entries(cat.commands))
        .find(([name]) => name === lastCommandBlock.command)?.[1]

      if (commandDef && commandDef.args.length > 0) {
        // check if there are any arg blocks for that group's command
        const argsForLastCommand = canvasBlocks.filter(b => b.groupId === lastCommandBlock.groupId && b.type === 'arg')
        if (argsForLastCommand.length === 0) {
          // don't allow adding another command until at least one arg chosen or command removed
          setOutputLines(prev => [...prev, `Please add an argument for "${lastCommandBlock.command}" or remove it before adding another command.`])
          return
        }
      }
    }

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

  // Replace removeBlock to also delete parent command if it's the last arg in that group
  const removeBlock = (id: number) => {
    setCanvasBlocks(prev => {
      const toRemove = prev.find(b => b.id === id)
      if (!toRemove) return prev

      // If removing an arg, check if it's the last arg for its group and remove parent command as well
      if (toRemove.type === 'arg') {
        const groupId = toRemove.groupId
        const remainingArgs = prev.filter(b => b.groupId === groupId && b.type === 'arg' && b.id !== id)
        if (remainingArgs.length === 0) {
          // remove both this arg and the associated command block(s)
          return prev.filter(b => !(b.groupId === groupId && (b.type === 'arg' && b.id === id || b.type === 'command')))
        }
      }

      // Normal removal
      return prev.filter(b => b.id !== id)
    })
  }

  const updateBlockValue = (id: number, value: string) => setCanvasBlocks(prev => prev.map(b => b.id === id ? { ...b, value } : b))
  const clearCanvas = () => { setCanvasBlocks([]); setOutputLines(['Ready to execute commands...']) }
  const executeCommand = () => { const command = generateCommand(); if (!command) return; setOutputLines(prev => [...prev, `$ ${command}`, 'Command would be executed here (demo only)']) }
  const toggleCategory = (name: string) => { setExpandedCategories(prev => { const newSet = new Set(prev); newSet.has(name) ? newSet.delete(name) : newSet.add(name); return newSet }) }

  const handleDragStart = (e: React.DragEvent, type: string, data: any) => {
    try {
      const json = JSON.stringify({ type, ...data })
      e.dataTransfer.effectAllowed = 'copy'
      e.dataTransfer.setData('application/json', json)
      e.dataTransfer.setData('text/plain', json) // fallback for some environments
    } catch (err) {
      console.error('handleDragStart error', err)
    }
  }

  // helper to append script blocks to canvas mapping ids/groupIds
  const appendScriptBlocksToCanvas = (blocks: Block[], append = true) => {
    const blocksToAdd: Block[] = []
    const groupMap = new Map<number, number>()
    let nextId = blockIdCounter

    for (const b of blocks) {
      if (b.type === 'command') {
        const newGroupId = nextId
        const mapped: Block = {
          ...b,
          id: nextId,
          groupId: newGroupId,
          value: b.value || b.command
        }
        blocksToAdd.push(mapped)
        groupMap.set(b.groupId, newGroupId)
        nextId++
      } else if (b.type === 'arg') {
        const mapped: Block = {
          ...b,
          id: nextId,
          groupId: groupMap.get(b.groupId) ?? nextId,
          value: b.value ?? (b.hasInput ? '' : b.arg ?? '')
        }
        blocksToAdd.push(mapped)
        nextId++
      }
    }

    setCanvasBlocks(prev => append ? [...prev, ...blocksToAdd] : [...blocksToAdd])
    setBlockIdCounter(nextId)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    try {
      // try both application/json and text/plain payloads
      let raw = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain')
      if (!raw) {
        console.warn('Drop had no payload. Available types:', e.dataTransfer.types)
        return
      }

      const data = JSON.parse(raw)
      
      if (data.type === 'command') {
        addCommandBlock(data.command)
        return
      } else if (data.type === 'arg') {
        addArgBlock(data.command, data.arg, data.hasInput, data.placeholder)
        return
      } else if (data.type === 'script' && Array.isArray(data.blocks)) {
        appendScriptBlocksToCanvas(data.blocks, true)
        return
      }
    } catch (error) {
      console.error('Error parsing drag data:', error)
    }
  }

  const commandPreview = generateCommand()

  // save or update (overwrite when editingScriptName is set)
  const handleSaveScript = async (name: string) => {
    if (!name || canvasBlocks.length === 0) {
      setOutputLines(prev => [...prev, 'Provide a script name and add blocks before saving.'])
      return
    }

    const payload = {
      name,
      blocks: canvasBlocks.map(b => ({ ...b })), // preserve order and full block data
      createdAt: new Date().toISOString()
    }

    try {
      const api = (window as any).api || (window as any).electronAPI

      if (editingScriptName) {
        // overwrite existing in-memory list
        setCustomScripts(prev => {
          const exists = prev.some(s => s.name === editingScriptName)
          const next = exists ? prev.map(s => s.name === editingScriptName ? payload : s) : [...prev, payload]
          persistCustomScripts(next)
          return next
        })
        if (api && typeof api.updateCustomScript === 'function') {
          await api.updateCustomScript(editingScriptName, payload)
        } else if (api && typeof api.saveCustomScriptsList === 'function') {
          await api.saveCustomScriptsList([...customScripts.filter(s => s.name !== editingScriptName), payload])
        }
        setOutputLines(prev => [...prev, `Updated script "${editingScriptName}" → "${name}".`])
        setEditingScriptName(null)
      } else {
        // new script
        setCustomScripts(prev => {
          const next = [...prev, payload]
          persistCustomScripts(next)
          return next
        })
        if (api && typeof api.saveCustomScript === 'function') {
          await api.saveCustomScript(payload)
        }
        setOutputLines(prev => [...prev, `Saved "${name}" (blocks) to custom scripts.`])
      }

      setIsSaveModalOpen(false)
    } catch (err) {
      console.error('Save blocks error', err)
      setOutputLines(prev => [...prev, `Failed to save "${name}".`])
    }
  }

  const handleDeleteScript = async (name: string) => {
    const next = customScripts.filter(s => s.name !== name)
    setCustomScripts(next)
    await persistCustomScripts(next)
    const api = (window as any).api || (window as any).electronAPI
    try {
      if (api && typeof api.deleteCustomScript === 'function') {
        await api.deleteCustomScript(name)
      }
    } catch (err) {
      console.error('deleteCustomScript error', err)
    }
    setOutputLines(prev => [...prev, `Deleted script "${name}".`])
  }

  // load script blocks into canvas for editing (replace canvas), open modal prefilled
  const handleEditScript = (name: string) => {
    const script = customScripts.find(s => s.name === name)
    if (!script) return
    // replace canvas with mapped blocks so user can modify
    appendScriptBlocksToCanvas(script.blocks, false)
    setEditingScriptName(name)
    setIsSaveModalOpen(true)
  }

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
        customScripts={customScripts}
        onDeleteScript={handleDeleteScript}
        onEditScript={handleEditScript}
      />
      <div style={{ width: '70%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Canvas canvasBlocks={canvasBlocks} isDragOver={isDragOver} setIsDragOver={setIsDragOver} handleDrop={handleDrop} updateBlockValue={updateBlockValue} removeBlock={removeBlock} clearCanvas={clearCanvas} onOpenSaveModal={() => { setEditingScriptName(null); setIsSaveModalOpen(true) }} />
        <Output outputLines={outputLines} commandPreview={commandPreview} executeCommand={executeCommand} />
      </div>

      <SaveScriptModal
        isOpen={isSaveModalOpen}
        onClose={() => { setIsSaveModalOpen(false); setEditingScriptName(null) }}
        canvasBlocks={canvasBlocks}
        onSave={handleSaveScript}
        initialName={editingScriptName ?? undefined}
      />
    </div>
  )
}

export default App
