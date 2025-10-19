import React, { useEffect, useState } from 'react'
import './App.css'
import { commandsData } from './data/commandsData'
import { Block, Category } from './types'
import Sidebar from './components/Sidebar'
import Canvas from './components/Canvas'
import Output from './components/Output'
import SaveScriptModal from './components/SaveScriptModal'
import { CategoryEditorModal } from './components/CategoryEditorModal'

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
  
  // Merge commandsData with custom categories
  const [categories, setCategories] = useState<{ [key: string]: Category }>(commandsData);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ name: string; data: Category } | undefined>();

  // Load custom categories on mount
  useEffect(() => {
    const api = (window as any).api || (window as any).electronAPI
    if (api && typeof api.getCustomCategories === 'function') {
      api.getCustomCategories().then((customCats: { [key: string]: Category }) => {
        if (customCats) {
          setCategories(prev => ({ ...prev, ...customCats }))
        }
      }).catch(() => {
        const existing = JSON.parse(localStorage.getItem('customCategories') || '{}')
        setCategories(prev => ({ ...prev, ...existing }))
      })
    } else {
      const existing = JSON.parse(localStorage.getItem('customCategories') || '{}')
      setCategories(prev => ({ ...prev, ...existing }))
    }
  }, [])

  const persistCustomCategories = async (customCats: { [key: string]: Category }) => {
    const api = (window as any).api || (window as any).electronAPI
    try {
      if (api && typeof api.saveCustomCategories === 'function') {
        await api.saveCustomCategories(customCats)
      } else {
        localStorage.setItem('customCategories', JSON.stringify(customCats))
      }
    } catch (err) {
      console.error('persistCustomCategories error', err)
      localStorage.setItem('customCategories', JSON.stringify(customCats))
    }
  }

  const handleSaveCategory = async (categoryName: string, category: Category) => {
    setCategories(prev => ({
      ...prev,
      [categoryName]: category
    }));
    
    // Save only custom categories
    const customCats = Object.fromEntries(
      Object.entries({ ...categories, [categoryName]: category })
        .filter(([_, cat]) => cat.isCustom)
    )
    await persistCustomCategories(customCats)
    
    setEditingCategory(undefined);
    setOutputLines(prev => [...prev, `Saved category "${categoryName}".`])
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (confirm(`Delete category "${categoryName}"?`)) {
      setCategories(prev => {
        const updated = { ...prev };
        delete updated[categoryName];
        return updated;
      });
      
      const customCats = Object.fromEntries(
        Object.entries(categories)
          .filter(([name, cat]) => cat.isCustom && name !== categoryName)
      )
      await persistCustomCategories(customCats)
      
      setOutputLines(prev => [...prev, `Deleted category "${categoryName}".`])
    }
  };

  const handleEditCategory = (categoryName: string) => {
    setEditingCategory({
      name: categoryName,
      data: categories[categoryName]
    });
    setIsModalOpen(true);
  };

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

    return commands.join(' && ')
  }

  const addCommandBlock = (commandName: string) => {
    const lastCommandBlock = [...canvasBlocks].reverse().find(b => b.type === 'command')
    if (lastCommandBlock) {
      const commandDef = Object.values(categories)
        .flatMap(cat => Object.entries(cat.commands))
        .find(([name]) => name === lastCommandBlock.command)?.[1]

      if (commandDef && commandDef.args.length > 0) {
        const argsForLastCommand = canvasBlocks.filter(b => b.groupId === lastCommandBlock.groupId && b.type === 'arg')
        if (argsForLastCommand.length === 0) {
          setOutputLines(prev => [...prev, `Please add an argument for "${lastCommandBlock.command}" or remove it before adding another command.`])
          return
        }
      }
    }

    const newGroupId = blockIdCounter
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

  const addArgBlock = async (commandName: string, argName: string, hasInput: boolean, placeholder?: string) => {
    const lastCommandBlock = [...canvasBlocks].reverse().find(b => b.type === 'command')
    const groupId = lastCommandBlock ? lastCommandBlock.groupId : blockIdCounter

    let value = hasInput ? '' : argName;

    if (hasInput) {
      const api = (window as any).api || (window as any).electronAPI;
      if (api && typeof api.openFileDialog === 'function') {
        const selectedPath = await api.openFileDialog();
        if (selectedPath) {
          value = selectedPath;
        }
      }
    }

    const block: Block = {
      id: blockIdCounter,
      type: 'arg',
      command: commandName,
      arg: argName,
      hasInput: hasInput,
      placeholder: placeholder,
      groupId: groupId,
      value: value
    }
    
    setCanvasBlocks(prev => [...prev, block])
    setBlockIdCounter(prev => prev + 1)
  }

  const removeBlock = (id: number) => {
    setCanvasBlocks(prev => {
      const toRemove = prev.find(b => b.id === id)
      if (!toRemove) return prev

      if (toRemove.type === 'arg') {
        const groupId = toRemove.groupId
        const remainingArgs = prev.filter(b => b.groupId === groupId && b.type === 'arg' && b.id !== id)
        if (remainingArgs.length === 0) {
          return prev.filter(b => !(b.groupId === groupId && (b.type === 'arg' && b.id === id || b.type === 'command')))
        }
      }

      return prev.filter(b => b.id !== id)
    })
  }

  const updateBlockValue = (id: number, value: string) => setCanvasBlocks(prev => prev.map(b => b.id === id ? { ...b, value } : b))
  const clearCanvas = () => { setCanvasBlocks([]); setOutputLines(['Ready to execute commands...']) }
  
  const executeCommand = async () => {
    const command = generateCommand();
    if (!command) return;

    setOutputLines(prev => [...prev, `$ ${command}`]);

    try {
      const api = (window as any).ipcRenderer; 
      
      if (api && typeof api.executeCommand === 'function') {
        const result = await api.executeCommand(command);
        
        if (result.success) {
          setOutputLines(prev => [...prev, result.output || 'Command executed successfully']);
        } else {
          setOutputLines(prev => [...prev, `Error: ${result.error}`]);
        }
      } else {
        setOutputLines(prev => [...prev, 'Electron API not available (running in browser)']);
      }
    } catch (err) {
      setOutputLines(prev => [...prev, `Execution error: ${err}`]);
    }
  };

  const toggleCategory = (name: string) => { setExpandedCategories(prev => { const newSet = new Set(prev); newSet.has(name) ? newSet.delete(name) : newSet.add(name); return newSet }) }

  const handleDragStart = (e: React.DragEvent, type: string, data: any) => {
    try {
      const json = JSON.stringify({ type, ...data })
      e.dataTransfer.effectAllowed = 'copy'
      e.dataTransfer.setData('application/json', json)
      e.dataTransfer.setData('text/plain', json)
    } catch (err) {
      console.error('handleDragStart error', err)
    }
  }

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

  const handleSaveScript = async (name: string) => {
    if (!name || canvasBlocks.length === 0) {
      setOutputLines(prev => [...prev, 'Provide a script name and add blocks before saving.'])
      return
    }

    const payload = {
      name,
      blocks: canvasBlocks.map(b => ({ ...b })),
      createdAt: new Date().toISOString()
    }

    try {
      const api = (window as any).api || (window as any).electronAPI

      if (editingScriptName) {
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

  const handleEditScript = (name: string) => {
    const script = customScripts.find(s => s.name === name)
    if (!script) return
    appendScriptBlocksToCanvas(script.blocks, false)
    setEditingScriptName(name)
    setIsSaveModalOpen(true)
  }

  const openFileDialog = async (): Promise<string | undefined> => {
    const api = (window as any).api || (window as any).electronAPI || (window as any).ipcRenderer;

    try {
      if (api && typeof api.openFileDialog === 'function') {
        return await api.openFileDialog({
          allowDirectories: true,
          allowFiles: true,
        });
      }

      return await new Promise<string | undefined>((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.style.display = 'none';

        input.onchange = () => {
          const file = input.files && input.files[0];
          if (!file) return resolve(undefined);
          resolve(file.name);
        };

        document.body.appendChild(input);
        input.click();
        setTimeout(() => document.body.removeChild(input), 2000);
      });
    } catch (err) {
      console.error('openFileDialog error', err);
      return undefined;
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      padding: '12px', 
      gap: '12px', 
      background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%)', 
      color: '#e0e0e0', 
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" 
    }}>
      {/* Left Column - Sidebar with Add Button on top */}
      <div style={{ 
        width: '30%', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px' 
      }}>
        <button
          onClick={() => {
            setEditingCategory(undefined);
            setIsModalOpen(true);
          }}
          style={{
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #a3be8c 0%, #8fa876 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#1e1e2e',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(163, 190, 140, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(163, 190, 140, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(163, 190, 140, 0.3)';
          }}
        >
          ➕ Add Category
        </button>

        <Sidebar
          categories={categories}
          expandedCategories={expandedCategories}
          toggleCategory={toggleCategory}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleDragStart={handleDragStart}
          canvasBlocks={canvasBlocks}
          customScripts={customScripts}
          onDeleteScript={handleDeleteScript}
          onEditScript={handleEditScript}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      </div>

      {/* Right Column - Canvas and Output */}
      <div style={{ width: '70%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Canvas 
          canvasBlocks={canvasBlocks} 
          isDragOver={isDragOver} 
          setIsDragOver={setIsDragOver} 
          handleDrop={handleDrop} 
          updateBlockValue={updateBlockValue} 
          removeBlock={removeBlock} 
          clearCanvas={clearCanvas} 
          openFileDialog={openFileDialog} 
          onOpenSaveModal={() => { setEditingScriptName(null); setIsSaveModalOpen(true) }} 
        />
        <Output 
          outputLines={outputLines} 
          commandPreview={commandPreview} 
          executeCommand={executeCommand} 
        />
      </div>

      <SaveScriptModal
        isOpen={isSaveModalOpen}
        onClose={() => { setIsSaveModalOpen(false); setEditingScriptName(null) }}
        canvasBlocks={canvasBlocks}
        onSave={handleSaveScript}
        initialName={editingScriptName ?? undefined}
      />
      
      <CategoryEditorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(undefined);
        }}
        onSave={handleSaveCategory}
        editingCategory={editingCategory}
      />
    </div>
  )
}

export default App