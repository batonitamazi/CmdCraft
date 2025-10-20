// src/hooks/useBlocks.ts
import { useState, useCallback } from 'react';
import { Block, Category } from '../types';
import { electronService } from '../services/electronService';

export const useBlocks = () => {
  const [canvasBlocks, setCanvasBlocks] = useState<Block[]>([]);
  const [blockIdCounter, setBlockIdCounter] = useState(0);

  const addCommandBlock = useCallback((commandName: string, categories: Record<string, Category>) => {
    const lastCommandBlock = [...canvasBlocks]
      .reverse()
      .find(b => b.type === 'command');

    if (lastCommandBlock) {
      const commandDef = Object.values(categories)
        .flatMap(cat => Object.entries(cat.commands))
        .find(([name]) => name === lastCommandBlock.command)?.[1];

      if (commandDef && commandDef.args.length > 0) {
        const argsForLastCommand = canvasBlocks.filter(
          b => b.groupId === lastCommandBlock.groupId && b.type === 'arg'
        );
        if (argsForLastCommand.length === 0) {
          return { 
            success: false, 
            error: `Please add an argument for "${lastCommandBlock.command}"` 
          };
        }
      }
    }

    const newGroupId = blockIdCounter;
    const block: Block = {
      id: blockIdCounter,
      type: 'command',
      command: commandName,
      value: commandName,
      groupId: newGroupId
    };

    setCanvasBlocks(prev => [...prev, block]);
    setBlockIdCounter(prev => prev + 1);
    return { success: true };
  }, [canvasBlocks, blockIdCounter]);

  const addArgBlock = useCallback(async (
    commandName: string,
    argName: string,
    hasInput: boolean,
    placeholder?: string
  ) => {
    const lastCommandBlock = [...canvasBlocks]
      .reverse()
      .find(b => b.type === 'command');
    const groupId = lastCommandBlock ? lastCommandBlock.groupId : blockIdCounter;

    let value = hasInput ? '' : argName;

    // if (hasInput) {
    //   const selectedPath = await electronService.openFileDialog();
    //   if (selectedPath) {
    //     value = selectedPath;
    //   }
    // }

    const block: Block = {
      id: blockIdCounter,
      type: 'arg',
      command: commandName,
      arg: argName,
      hasInput,
      placeholder,
      groupId,
      value
    };

    setCanvasBlocks(prev => [...prev, block]);
    setBlockIdCounter(prev => prev + 1);
  }, [canvasBlocks, blockIdCounter]);

  const removeBlock = useCallback((id: number) => {
    setCanvasBlocks(prev => {
      const toRemove = prev.find(b => b.id === id);
      if (!toRemove) return prev;

      if (toRemove.type === 'arg') {
        const groupId = toRemove.groupId;
        const remainingArgs = prev.filter(
          b => b.groupId === groupId && b.type === 'arg' && b.id !== id
        );
        if (remainingArgs.length === 0) {
          return prev.filter(
            b => !(b.groupId === groupId && 
                  (b.type === 'arg' && b.id === id || b.type === 'command'))
          );
        }
      }

      return prev.filter(b => b.id !== id);
    });
  }, []);

  const updateBlockValue = useCallback((id: number, value: string) => {
    setCanvasBlocks(prev => 
      prev.map(b => b.id === id ? { ...b, value } : b)
    );
  }, []);

  const clearCanvas = useCallback(() => {
    setCanvasBlocks([]);
  }, []);

  const appendBlocks = useCallback((blocks: Block[], append = true) => {
    const blocksToAdd: Block[] = [];
    const groupMap = new Map<number, number>();
    let nextId = blockIdCounter;

    for (const b of blocks) {
      if (b.type === 'command') {
        const newGroupId = nextId;
        const mapped: Block = {
          ...b,
          id: nextId,
          groupId: newGroupId,
          value: b.value || b.command
        };
        blocksToAdd.push(mapped);
        groupMap.set(b.groupId, newGroupId);
        nextId++;
      } else if (b.type === 'arg') {
        const mapped: Block = {
          ...b,
          id: nextId,
          groupId: groupMap.get(b.groupId) ?? nextId,
          value: b.value ?? (b.hasInput ? '' : b.arg ?? '')
        };
        blocksToAdd.push(mapped);
        nextId++;
      }
    }

    setCanvasBlocks(prev => append ? [...prev, ...blocksToAdd] : [...blocksToAdd]);
    setBlockIdCounter(nextId);
  }, [blockIdCounter]);

  return {
    canvasBlocks,
    addCommandBlock,
    addArgBlock,
    removeBlock,
    updateBlockValue,
    clearCanvas,
    appendBlocks
  };
};