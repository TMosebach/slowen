import { app, BrowserWindow } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Development: Angular Dev Server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:4200');
  } else {
    // Production: Angular Build
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'slowen', 'index.html'));
  }
}

app.whenReady().then(createWindow);
