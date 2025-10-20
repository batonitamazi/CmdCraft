import { useState, useEffect } from 'react';
import { Block } from '../types';
import { storageService } from '../services/storageService';
import { electronService } from '../services/electronService';

export interface SavedScript {
  name: string;
  blocks: Block[];
  createdAt: string;
}

export const useScripts = () => {
  const [customScripts, setCustomScripts] = useState<SavedScript[]>([]);

  useEffect(() => {
    const loadScripts = async () => {
      const scripts = await storageService.loadCustomScripts();
      if (scripts && scripts.length > 0) {
        setCustomScripts(scripts);
      }
    };
    loadScripts();
  }, []);

  const saveScript = async (
    name: string,
    blocks: Block[],
    editingScriptName?: string | null
  ): Promise<{ success: boolean; message?: string }> => {
    if (!name || blocks.length === 0) {
      return { 
        success: false, 
        message: 'Provide a script name and add blocks before saving.' 
      };
    }

    const payload: SavedScript = {
      name,
      blocks: blocks.map(b => ({ ...b })),
      createdAt: new Date().toISOString()
    };

    try {
      if (editingScriptName) {
        // Update existing script
        const updatedScripts = customScripts.some(s => s.name === editingScriptName)
          ? customScripts.map(s => s.name === editingScriptName ? payload : s)
          : [...customScripts, payload];

        setCustomScripts(updatedScripts);
        await storageService.saveCustomScripts(updatedScripts);
        
        await electronService.updateCustomScript(editingScriptName, payload);
        
        return { 
          success: true, 
          message: `Updated script "${editingScriptName}" → "${name}".` 
        };
      } else {
        // Save new script
        const updatedScripts = [...customScripts, payload];
        setCustomScripts(updatedScripts);
        await storageService.saveCustomScripts(updatedScripts);
        
        await electronService.saveCustomScript(payload);
        
        return { 
          success: true, 
          message: `Saved "${name}" (blocks) to custom scripts.` 
        };
      }
    } catch (err) {
      console.error('Save script error', err);
      return { success: false };
    }
  };

  const deleteScript = async (name: string) => {
    const updatedScripts = customScripts.filter(s => s.name !== name);
    setCustomScripts(updatedScripts);
    await storageService.saveCustomScripts(updatedScripts);
    await electronService.deleteCustomScript(name);
  };

  return {
    customScripts,
    saveScript,
    deleteScript
  };
};