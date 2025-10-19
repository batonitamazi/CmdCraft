import { ipcMain, dialog, app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";
const execPromise = promisify(exec);
const executeShellCommand = async (command) => {
  try {
    const platform = os.platform();
    let finalCommand = command;
    if (platform === "win32") {
      finalCommand = `cmd /c ${command}`;
    }
    const { stdout, stderr } = await execPromise(finalCommand);
    if (stderr) {
      throw new Error(stderr);
    }
    return stdout.trim();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Command execution failed: ${message}`);
  }
};
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
ipcMain.handle("execute-command", async (event, command) => {
  try {
    console.log(event);
    const output = await executeShellCommand(command);
    return { success: true, output };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
});
ipcMain.handle("open-file-dialog", async (event, opts) => {
  const properties = [];
  if (opts == null ? void 0 : opts.allowFiles) {
    properties.push("openFile");
  }
  if (opts == null ? void 0 : opts.allowDirectories) {
    properties.push("openDirectory");
  }
  if (properties.length === 0) {
    properties.push("openFile", "openDirectory");
  }
  try {
    const result = await dialog.showOpenDialog({
      properties,
      title: (opts == null ? void 0 : opts.allowDirectories) && (opts == null ? void 0 : opts.allowFiles) ? "Select a file or folder" : (opts == null ? void 0 : opts.allowDirectories) ? "Select a folder" : "Select a file"
    });
    if (result.canceled || result.filePaths.length === 0) {
      return void 0;
    }
    return result.filePaths[0];
  } catch (error) {
    console.error("Dialog error:", error);
    return void 0;
  }
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
