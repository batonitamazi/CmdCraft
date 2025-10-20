// src/services/storageService.ts
import { electronService } from './electronService';
import { Category, Block } from '../types';

class StorageService {
  // Custom Categories
  async loadCustomCategories(): Promise<{ [key: string]: Category }> {
    const electronData = await electronService.getCustomCategories();
    if (electronData) {
      return electronData;
    }

    try {
      const localData = localStorage.getItem('customCategories');
      return localData ? JSON.parse(localData) : {};
    } catch (err) {
      console.error('loadCustomCategories error', err);
      return {};
    }
  }

  async saveCustomCategories(categories: { [key: string]: Category }): Promise<void> {
    const saved = await electronService.saveCustomCategories(categories);
    
    if (!saved) {
      try {
        localStorage.setItem('customCategories', JSON.stringify(categories));
      } catch (err) {
        console.error('localStorage saveCustomCategories error', err);
      }
    }
  }

  // Custom Scripts
  async loadCustomScripts(): Promise<{ 
    name: string; 
    blocks: Block[]; 
    createdAt: string 
  }[]> {
    const electronData = await electronService.getCustomScripts();
    if (electronData) {
      return electronData;
    }

    try {
      const localData = localStorage.getItem('customScripts');
      return localData ? JSON.parse(localData) : [];
    } catch (err) {
      console.error('loadCustomScripts error', err);
      return [];
    }
  }

  async saveCustomScripts(scripts: { 
    name: string; 
    blocks: Block[]; 
    createdAt: string 
  }[]): Promise<void> {
    const saved = await electronService.saveCustomScriptsList(scripts);
    
    if (!saved) {
      try {
        localStorage.setItem('customScripts', JSON.stringify(scripts));
      } catch (err) {
        console.error('localStorage saveCustomScripts error', err);
      }
    }
  }
}

export const storageService = new StorageService();