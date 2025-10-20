// src/utils/commandGenerator.ts
import { Block } from '../types';

export const generateCommand = (canvasBlocks: Block[]): string => {
  if (canvasBlocks.length === 0) return '';

  const groups: Record<number, Block[]> = {};
  
  canvasBlocks.forEach(block => {
    if (!groups[block.groupId]) {
      groups[block.groupId] = [];
    }
    groups[block.groupId].push(block);
  });

  const commands = Object.values(groups).map(blocks => {
    const parts: string[] = [];
    
    blocks.forEach(block => {
      if (block.type === 'command') {
        parts.push(block.command);
      } else if (block.type === 'arg') {
        if (block.hasInput && block.value) {
          if (!block.arg!.startsWith('-')) {
            parts.push(block.value);
          } else {
            parts.push(`${block.arg} ${block.value}`);
          }
        } else if (!block.hasInput) {
          parts.push(block.arg!);
        }
      }
    });
    
    return parts.join(' ');
  });

  return commands.join(' && ');
};

export const validateCommandChain = (
  canvasBlocks: Block[],
  categories: any
): { valid: boolean; error?: string } => {
  const lastCommandBlock = [...canvasBlocks]
    .reverse()
    .find(b => b.type === 'command');

  if (!lastCommandBlock) {
    return { valid: true };
  }

  const commandDef = Object.values(categories)
    .flatMap(cat => Object.entries(cat.commands))
    .find(([name]) => name === lastCommandBlock.command)?.[1];

  if (commandDef && commandDef.args.length > 0) {
    const argsForLastCommand = canvasBlocks.filter(
      b => b.groupId === lastCommandBlock.groupId && b.type === 'arg'
    );
    
    if (argsForLastCommand.length === 0) {
      return {
        valid: false,
        error: `Please add an argument for "${lastCommandBlock.command}" or remove it`
      };
    }
  }

  return { valid: true };
};