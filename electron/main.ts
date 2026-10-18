import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { registerAccountsIPC } from './ipc/accounts.ipc';
import { registerBackupIPC } from './ipc/backup.ipc';
import { registerBookingsIPC } from './ipc/bookings.ipc';
import { registerDepotPositionsIPC } from './ipc/depot-positions.ipc';
import { registerSecuritiesIPC } from './ipc/securities.ipc';
import { registerSecurityPricesIPC } from './ipc/security-prices.ipc';

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
  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:4200');
  } else {
    // Production: Angular Build (Angular CLI outputs browser build to dist/slowen/browser)
    const indexPath = path.join(__dirname, '..', '..', 'dist', 'slowen', 'browser', 'index.html');
    mainWindow.loadFile(indexPath);
  }
}

app.whenReady().then(() => {
  registerAccountsIPC();
  registerBackupIPC();
  registerBookingsIPC();
  registerDepotPositionsIPC();
  registerSecuritiesIPC();
  registerSecurityPricesIPC();
  createWindow();
});
