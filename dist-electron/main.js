import { ipcMain as s, dialog as w, app as l, BrowserWindow as m } from "electron";
import { fileURLToPath as h } from "node:url";
import i from "node:path";
import { exec as g } from "child_process";
import { promisify as p } from "util";
import E from "os";
const R = p(g), _ = async (t) => {
  try {
    const e = E.platform();
    let r = t;
    e === "win32" && (r = `cmd /c ${t}`);
    const { stdout: o, stderr: c } = await R(r);
    if (c)
      throw new Error(c);
    return o.trim();
  } catch (e) {
    const r = e instanceof Error ? e.message : String(e);
    throw new Error(`Command execution failed: ${r}`);
  }
}, d = i.dirname(h(import.meta.url));
process.env.APP_ROOT = i.join(d, "..");
const a = process.env.VITE_DEV_SERVER_URL, y = i.join(process.env.APP_ROOT, "dist-electron"), f = i.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = a ? i.join(process.env.APP_ROOT, "public") : f;
let n;
function u() {
  n = new m({
    icon: i.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: i.join(d, "preload.mjs"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), n.webContents.on("did-finish-load", () => {
    n == null || n.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), a ? n.loadURL(a) : n.loadFile(i.join(f, "index.html"));
}
s.handle("execute-command", async (t, e) => {
  try {
    return console.log(t), { success: !0, output: await _(e) };
  } catch (r) {
    return { success: !1, error: r instanceof Error ? r.message : String(r) };
  }
});
s.handle("open-file-dialog", async (t, e) => {
  const r = [];
  e != null && e.allowFiles && r.push("openFile"), e != null && e.allowDirectories && r.push("openDirectory"), r.length === 0 && r.push("openFile", "openDirectory");
  try {
    const o = await w.showOpenDialog({
      properties: r,
      title: e != null && e.allowDirectories && (e != null && e.allowFiles) ? "Select a file or folder" : e != null && e.allowDirectories ? "Select a folder" : "Select a file"
    });
    return o.canceled || o.filePaths.length === 0 ? void 0 : o.filePaths[0];
  } catch (o) {
    console.error("Dialog error:", o);
    return;
  }
});
l.on("window-all-closed", () => {
  process.platform !== "darwin" && (l.quit(), n = null);
});
l.on("activate", () => {
  m.getAllWindows().length === 0 && u();
});
l.whenReady().then(u);
export {
  y as MAIN_DIST,
  f as RENDERER_DIST,
  a as VITE_DEV_SERVER_URL
};
