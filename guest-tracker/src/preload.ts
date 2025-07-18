// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron/renderer';

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  loadList: (path?: string) => ipcRenderer.invoke("test", { pathToCsv: path ? path : null}),
  getConfig: () => ipcRenderer.invoke("get-config"),
  saveData: (csvData: any) => ipcRenderer.invoke("save-data", { csvData: csvData })
})