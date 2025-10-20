// src/hooks/useDragAndDrop.ts
import React, { useCallback } from 'react';
import { Block } from '../types';

interface UseDragAndDropProps {
  addCommandBlock: (commandName: string, categories: any) => { success: boolean; error?: string };
  addArgBlock: (commandName: string, argName: string, hasInput: boolean, placeholder?: string) => void;
  appendBlocks: (blocks: Block[], append?: boolean) => void;
  categories: { [key: string]: any };
}

export const useDragAndDrop = ({
  addCommandBlock,
  addArgBlock,
  appendBlocks,
  categories
}: UseDragAndDropProps) => {
  
  const handleDragStart = useCallback((e: React.DragEvent, type: string, data: any) => {
    try {
      const json = JSON.stringify({ type, ...data });
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('application/json', json);
      e.dataTransfer.setData('text/plain', json);
    } catch (err) {
      console.error('handleDragStart error', err);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    try {
      let raw = e.dataTransfer.getData('application/json') || 
                e.dataTransfer.getData('text/plain');
      
      if (!raw) {
        console.warn('Drop had no payload. Available types:', e.dataTransfer.types);
        return;
      }

      const data = JSON.parse(raw);
      console.log('Dropped data:', data);
      if (data.type === 'command') {
        addCommandBlock(data.command, categories);
        return;
      } else if (data.type === 'arg') {
        addArgBlock(data.command, data.arg, data.hasInput, data.placeholder);
        return;
      } else if (data.type === 'script' && Array.isArray(data.blocks)) {
        appendBlocks(data.blocks, true);
        return;
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  }, [addCommandBlock, addArgBlock, appendBlocks, categories]);

  return {
    handleDragStart,
    handleDrop
  };
};