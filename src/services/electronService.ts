// src/services/electronService.ts
import { Category, Block } from '../types';

class ElectronService {
  private get api() {
    return (window as any).api || (window as any).electronAPI || (window as any).ipcRenderer;
  }

  private get isElectron() {
    return this.api !== undefined;
  }

  // File Operations
  async openFileDialog(options?: { 
    allowDirectories?: boolean; 
    allowFiles?: boolean 
  }): Promise<string | undefined> {
    if (!this.isElectron || typeof this.api.openFileDialog !== 'function') {
      return this.browserFileDialog();
    }

    try {
      return await this.api.openFileDialog(options);
    } catch (err) {
      console.error('openFileDialog error', err);
      return this.browserFileDialog();
    }
  }

  private browserFileDialog(): Promise<string | undefined> {
    return new Promise((resolve) => {
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
  }

  // Command Execution
  async executeCommand(command: string): Promise<{ 
    success: boolean; 
    output?: string; 
    error?: string 
  }> {
    if (!this.isElectron || typeof this.api.executeCommand !== 'function') {
      return { 
        success: false, 
        error: 'Electron API not available (running in browser)' 
      };
    }

    try {
      return await this.api.executeCommand(command);
    } catch (err) {
      return { 
        success: false, 
        error: `Execution error: ${err}` 
      };
    }
  }

  // Custom Categories
  async getCustomCategories(): Promise<{ [key: string]: Category } | null> {
    if (!this.isElectron || typeof this.api.getCustomCategories !== 'function') {
      return null;
    }

    try {
      return await this.api.getCustomCategories();
    } catch (err) {
      console.error('getCustomCategories error', err);
      return null;
    }
  }

  async saveCustomCategories(categories: { [key: string]: Category }): Promise<boolean> {
    if (!this.isElectron || typeof this.api.saveCustomCategories !== 'function') {
      return false;
    }

    try {
      await this.api.saveCustomCategories(categories);
      return true;
    } catch (err) {
      console.error('saveCustomCategories error', err);
      return false;
    }
  }

  // Custom Scripts
  async getCustomScripts(): Promise<any[] | null> {
    if (!this.isElectron || typeof this.api.getCustomScripts !== 'function') {
      return null;
    }

    try {
      const list = await this.api.getCustomScripts();
      return Array.isArray(list) ? list : null;
    } catch (err) {
      console.error('getCustomScripts error', err);
      return null;
    }
  }

  async saveCustomScript(script: { 
    name: string; 
    blocks: Block[]; 
    createdAt: string 
  }): Promise<boolean> {
    if (!this.isElectron || typeof this.api.saveCustomScript !== 'function') {
      return false;
    }

    try {
      await this.api.saveCustomScript(script);
      return true;
    } catch (err) {
      console.error('saveCustomScript error', err);
      return false;
    }
  }

  async saveCustomScriptsList(scripts: any[]): Promise<boolean> {
    if (!this.isElectron || typeof this.api.saveCustomScriptsList !== 'function') {
      return false;
    }

    try {
      await this.api.saveCustomScriptsList(scripts);
      return true;
    } catch (err) {
      console.error('saveCustomScriptsList error', err);
      return false;
    }
  }

  async updateCustomScript(oldName: string, newScript: any): Promise<boolean> {
    if (!this.isElectron || typeof this.api.updateCustomScript !== 'function') {
      return false;
    }

    try {
      await this.api.updateCustomScript(oldName, newScript);
      return true;
    } catch (err) {
      console.error('updateCustomScript error', err);
      return false;
    }
  }

  async deleteCustomScript(name: string): Promise<boolean> {
    if (!this.isElectron || typeof this.api.deleteCustomScript !== 'function') {
      return false;
    }

    try {
      await this.api.deleteCustomScript(name);
      return true;
    } catch (err) {
      console.error('deleteCustomScript error', err);
      return false;
    }
  }
}

export const electronService = new ElectronService();