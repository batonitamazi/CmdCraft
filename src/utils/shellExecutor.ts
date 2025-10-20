import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execPromise = promisify(exec);

export const executeShellCommand = async (command: string): Promise<string> => {
  try {
    const platform = os.platform();
    let finalCommand = command;

    // Adjust command for Windows if necessary
    if (platform === 'win32') {
      finalCommand = `cmd /c ${command}`;
    }
    const env = {
      ...process.env,
      PATH: process.env.PATH + ':/usr/local/bin:/opt/homebrew/bin'
    };
    const { stdout, stderr } = await execPromise(finalCommand, { env });

    if (stderr) {
      throw new Error(stderr);
    }

    return stdout.trim();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Command execution failed: ${message}`);
  }
};