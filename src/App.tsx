// src/App.tsx - Refactored
import React, { useState } from 'react';
import './App.css';
import { commandsData } from './data/commandsData';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import Output from './components/Output';
import SaveScriptModal from './components/SaveScriptModal';
import { CategoryEditorModal } from './components/CategoryEditorModal';

import { useBlocks } from './hooks/useBlocks';
import { useCategories } from './hooks/useCategories';
import { useScripts } from './hooks/useScripts';
import { useCommandExecution } from './hooks/useCommandExecutor';
import { useDragAndDrop } from './hooks/useDragAndDrop';

import { generateCommand } from './utils/commandGenerator';
import { electronService } from './services/electronService';

function App() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScriptName, setEditingScriptName] = useState<string | null>(null);

  const blocks = useBlocks();
  const categories = useCategories(commandsData);
  const scripts = useScripts();
  const execution = useCommandExecution();
  const dragDrop = useDragAndDrop({
    addCommandBlock: blocks.addCommandBlock,
    addArgBlock: blocks.addArgBlock,
    appendBlocks: blocks.appendBlocks,
    categories: categories.categories
  });

  // Event Handlers
  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      newSet.has(name) ? newSet.delete(name) : newSet.add(name);
      return newSet;
    });
  };

  const handleSaveScript = async (name: string) => {
    if (!name || blocks.canvasBlocks.length === 0) {
      execution.addOutput('Provide a script name and add blocks before saving.');
      return;
    }

    const result = await scripts.saveScript(
      name,
      blocks.canvasBlocks,
      editingScriptName
    );

    if (result.success) {
      execution.addOutput(result.message!);
      setIsSaveModalOpen(false);
      setEditingScriptName(null);
    } else {
      execution.addOutput(`Failed to save "${name}".`);
    }
  };

  const handleEditScript = (name: string) => {
    const script = scripts.customScripts.find(s => s.name === name);
    if (!script) return;
    
    blocks.appendBlocks(script.blocks, false);
    setEditingScriptName(name);
    setIsSaveModalOpen(true);
  };

  const handleDeleteScript = async (name: string) => {
    await scripts.deleteScript(name);
    execution.addOutput(`Deleted script "${name}".`);
  };

  const handleExecuteCommand = async () => {
    const command = generateCommand(blocks.canvasBlocks);
    if (!command) return;

    execution.addOutput(`$ ${command}`);
    const result = await electronService.executeCommand(command);

    if (result.success) {
      execution.addOutput(result.output || 'Command executed successfully');
    } else {
      execution.addOutput(`Error: ${result.error}`);
    }
  };

  const handleClearCanvas = () => {
    blocks.clearCanvas();
    execution.clearOutput();
  };

  const openFileDialog = async () => {
    return await electronService.openFileDialog({
      allowDirectories: true,
      allowFiles: true
    });
  };

  const commandPreview = generateCommand(blocks.canvasBlocks);

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
      {/* Left Column */}
      <div style={{
        width: '30%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <button
          onClick={() => {
            categories.setEditingCategory(undefined);
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
        >
          ➕ Add Category
        </button>

        <Sidebar
          categories={categories.categories}
          expandedCategories={expandedCategories}
          toggleCategory={toggleCategory}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleDragStart={dragDrop.handleDragStart}
          canvasBlocks={blocks.canvasBlocks}
          customScripts={scripts.customScripts}
          onDeleteScript={handleDeleteScript}
          onEditScript={handleEditScript}
          onEditCategory={(name) => {
            categories.setEditingCategory({
              name,
              data: categories.categories[name]
            });
            setIsModalOpen(true);
          }}
          onDeleteCategory={async (name) => {
            if (confirm(`Delete category "${name}"?`)) {
              await categories.deleteCategory(name);
              execution.addOutput(`Deleted category "${name}".`);
            }
          }}
        />
      </div>

      {/* Right Column */}
      <div style={{ width: '70%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Canvas
          canvasBlocks={blocks.canvasBlocks}
          isDragOver={isDragOver}
          setIsDragOver={setIsDragOver}
          handleDrop={dragDrop.handleDrop}
          updateBlockValue={blocks.updateBlockValue}
          removeBlock={blocks.removeBlock}
          clearCanvas={handleClearCanvas}
          openFileDialog={openFileDialog}
          onOpenSaveModal={() => {
            setEditingScriptName(null);
            setIsSaveModalOpen(true);
          }}
        />
        <Output
          outputLines={execution.outputLines}
          commandPreview={commandPreview}
          executeCommand={handleExecuteCommand}
        />
      </div>

      <SaveScriptModal
        isOpen={isSaveModalOpen}
        onClose={() => {
          setIsSaveModalOpen(false);
          setEditingScriptName(null);
        }}
        canvasBlocks={blocks.canvasBlocks}
        onSave={handleSaveScript}
        initialName={editingScriptName ?? undefined}
      />

      <CategoryEditorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          categories.setEditingCategory(undefined);
        }}
        onSave={async (categoryName, category) => {
          await categories.saveCategory(categoryName, category);
          execution.addOutput(`Saved category "${categoryName}".`);
        }}
        editingCategory={categories.editingCategory}
      />
    </div>
  );
}

export default App;