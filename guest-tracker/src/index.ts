import { app, BrowserWindow, ipcMain } from 'electron';
import electron from 'electron';
import fs from 'fs';
import path from 'path';
import Papa from "papaparse";
const globalShortcut = electron.globalShortcut;
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}
const isDebug = process.env.TESTING === 'true';
console.log(isDebug);
const handleSetTitle = (event: any, title: string) => {
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)
  win.setTitle(title)
}

let defaultConfig = {
    "pathToCsv" : path.join(app.getPath('documents'), '\\list.csv'),
}
let config : any = null;
const configRootPath = path.join(app.getPath('userData'), 'settings.json');
if(fs.existsSync(configRootPath)){
  fs.readFile(configRootPath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.log(`File '${configRootPath}' does not exist.`);
      } else {
        console.error('Error reading file:', err);
      }
      return;
    }
    console.log(`File '${configRootPath}' content:`, data);
    config = JSON.parse(data);
  });
} else {
  fs.writeFile(configRootPath, JSON.stringify(defaultConfig), (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return;
    }
    console.log(`Content written to '${configRootPath}' (file created if it didn't exist).`);
    config = defaultConfig;
  });
}
console.log(config);
const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    minHeight: 800,
    minWidth: 600,
    darkTheme: true,
    center: true,
    fullscreenable: false,
    fullscreen: false,
    frame: false,
    hasShadow: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
if (process.env.NODE_ENV === 'development') {
  console.log('Running in development environment');
  mainWindow.webContents.openDevTools();
  // Enable development-specific features, logging, etc.
} else if (process.env.NODE_ENV === 'production') {
  console.log('Running in production environment');
  // Disable debug features, optimize for performance, etc.
} else {
  console.log('Running in an unknown environment:', process.env.NODE_ENV);
}

  // shortcuts
	globalShortcut.register('f5', function() {
		console.log('f5 is pressed')
		mainWindow.reload()
	})
	globalShortcut.register('CommandOrControl+R', function() {
		console.log('CommandOrControl+R is pressed')
		mainWindow.reload()
	})

  // IPC functions exposed via a bridge in preload 
  ipcMain.on('minimize-window', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      window.minimize();
    }
  });

  ipcMain.on('close-window', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      window.close();
    }
  });

  ipcMain.handle('test', async (event, args) => {
        return new Promise((resolve, reject) => {
    Papa.parse(fs.createReadStream(args.pathToCsv ? args.pathToCsv : defaultConfig.pathToCsv), {
      header: true,
      transformHeader: function(h) {
        return h.trim().replace(/"/g, '');
      },
      complete: function(results) {
        resolve(JSON.stringify(results.data)); // Resolve with parsed data
      },
      error: function(error: any) {
        reject(error); // Reject on error
      }
    });
  });
  });
  ipcMain.handle('get-config', async () => {
    return config;
  })
  ipcMain.handle('save-data', async (event, args: any) => {
    return new Promise((resolve, reject) => {
        let data = args.csvData;
        fs.writeFile(config.pathToCsv, data, (err) => {
        if (err) {
          console.error('Error writing CSV file:', err);
          reject(err);
        } else {
          console.log('CSV file written successfully!');
          resolve("Saved!");
        }
      });
    })
  })
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
