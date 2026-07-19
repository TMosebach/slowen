# Electron-Setup Design

## Überblick

Grundgerüst für Electron + Angular 19 Desktop-Applikation "Slowen" mit:
- Angular 19 Standalone Components
- Tailwind CSS v4 (Vite-Integration)
- Electron mit contextBridge/preload
- electron-builder für Mac OS Builds

## Projektstruktur

```
slowen/
├── src/                          # Angular Frontend
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── main.ts
│   └── index.html
├── electron/                     # Electron
│   ├── main.ts                   # Electron Main Process Entry
│   ├── preload/
│   │   └── preload.ts           # contextBridge API
│   └── ipc/                      # IPC Handler
│       └── accounts.ipc.ts
├── angular.json
├── package.json
└── tsconfig.json
```

## Dependencies

- `electron`
- `electron-builder`
- `better-sqlite3`
- `@electron/rebuild`

## Scripts

```json
{
  "start": "ng serve & electron .",
  "build": "ng build",
  "build:prod": "ng build --configuration production",
  "electron:dev": "electron .",
  "dist": "electron-builder --mac",
  "test": "ng test",
  "lint": "ng lint"
}
```

## Electron Main Process

```typescript
// electron/main.ts
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
```

## Preload Script (Zentrale API)

```typescript
// electron/preload/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Accounts
  accounts: {
    getAll: () => ipcRenderer.invoke('accounts:getAll'),
    getById: (id: number) => ipcRenderer.invoke('accounts:getById', id),
    create: (account: any) => ipcRenderer.invoke('accounts:create', account),
    update: (id: number, account: any) => ipcRenderer.invoke('accounts:update', id, account),
    delete: (id: number) => ipcRenderer.invoke('accounts:delete', id)
  }
});
```

## IPC Handler (Accounts)

```typescript
// electron/ipc/accounts.ipc.ts
import { ipcMain } from 'electron';
import { accounts } from '../database/accounts';

export function registerAccountsIPC() {
  ipcMain.handle('accounts:getAll', async () => {
    return accounts.getAll();
  });

  ipcMain.handle('accounts:getById', async (event, id) => {
    return accounts.getById(id);
  });

  ipcMain.handle('accounts:create', async (event, account) => {
    return accounts.create(account);
  });

  ipcMain.handle('accounts:update', async (event, id, account) => {
    return accounts.update(id, account);
  });

  ipcMain.handle('accounts:delete', async (event, id) => {
    return accounts.delete(id);
  });
}
```

## Testing

- Jasmine/Karma für Angular Unit Tests
- `ng test` für Test-Lauf
- `npm run lint` für Code-Qualität

## Build

- `npm run build:prod` für Production Build
- `npm run dist` für Electron Package (Mac .app)
- electron-builder.json für Build-Konfiguration
