# Electron-Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Electron + Angular 19 Grundgerüst für Desktop-Finanzverwaltung "Slowen" aufsetzen

**Architecture:** Angular 19 Standalone Frontend in `src/`, Electron Main Process in `electron/`, IPC-Kommunikation via contextBridge/preload

**Tech Stack:** Electron, Angular 19, TypeScript, Tailwind CSS v4, better-sqlite3, electron-builder

## Global Constraints

- Plattform: Mac OS
- Sprache: Deutsch (Datums-/Zahlenformat)
- Angular 19 mit Standalone Components
- Tailwind CSS v4 mit Vite-Integration
- electron-builder für Mac OS Builds
- Spezifische IPC-Handler pro Ressource
- Zentrale API im Preload Script

---

## Task 1: Angular Projekt erstellen

**Files:**
- Create: `src/` (via Angular CLI)
- Create: `angular.json`
- Create: `package.json`
- Create: `tsconfig.json`

**Interfaces:**
- Produces: Angular Projekt mit Standalone Components

- [ ] **Schritt 1: Angular Projekt mit ng new erstellen**

```bash
ng new slowen --standalone --routing --style=scss --skip-git
```

- [ ] **Schritt 2: In Projektverzeichnis wechseln**

```bash
cd slowen
```

- [ ] **Schritt 3: Tailwind CSS v4 installieren**

```bash
npm install -D tailwindcss @tailwindcss/postcss postcss autoprefixer
```

- [ ] **Schritt 4: Tailwind Konfiguration erstellen**

```bash
npx tailwindcss init
```

- [ ] **Schritt 5: PostCSS Config erstellen**

```json
// postcss.config.json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

- [ ] **Schritt 6: Angular Styles anpassen**

```scss
/* src/styles.scss */
@import "tailwindcss";
```

- [ ] **Schritt 7: Commit**

```bash
git add .
git commit -m "feat: Angular 19 + Tailwind CSS v4 Setup"
```

---

## Task 2: Electron Dependencies installieren

**Files:**
- Modify: `package.json`

**Interfaces:**
- Consumes: Angular Projekt aus Task 1
- Produces: Electron Dependencies in package.json

- [ ] **Schritt 1: Electron Dependencies installieren**

```bash
npm install electron electron-builder @electron/rebuild better-sqlite3
```

- [ ] **Schritt 2: Dev Dependencies installieren**

```bash
npm install -D @types/better-sqlite3
```

- [ ] **Schritt 3: Package.json Scripts hinzufügen**

```json
// package.json - scripts section
{
  "scripts": {
    "start": "ng serve & electron .",
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "electron:dev": "electron .",
    "dist": "electron-builder --mac",
    "test": "ng test",
    "lint": "ng lint"
  }
}
```

- [ ] **Schritt 4: Electron Builder Konfiguration erstellen**

```json
// electron-builder.json
{
  "appId": "de.slowen.app",
  "productName": "Slowen",
  "directories": {
    "output": "dist-electron"
  },
  "files": [
    "dist/**/*",
    "electron/**/*"
  ],
  "mac": {
    "category": "public.app-category.finance",
    "target": "dmg"
  }
}
```

- [ ] **Schritt 5: Commit**

```bash
git add .
git commit -m "feat: Electron dependencies + builder config"
```

---

## Task 3: Electron Main Process erstellen

**Files:**
- Create: `electron/main.ts`
- Create: `electron/tsconfig.json`

**Interfaces:**
- Consumes: Electron Dependencies aus Task 2
- Produces: Electron Main Process Entry Point

- [ ] **Schritt 1: Electron TypeScript Config erstellen**

```json
// electron/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "../dist-electron",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["./**/*"],
  "exclude": ["node_modules", "dist", "dist-electron"]
}
```

- [ ] **Schritt 2: Electron Main Process erstellen**

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

- [ ] **Schritt 3: Main Entry in package.json setzen**

```json
// package.json
{
  "main": "electron/main.js"
}
```

- [ ] **Schritt 4: Commit**

```bash
git add .
git commit -m "feat: Electron Main Process"
```

---

## Task 4: Preload Script erstellen

**Files:**
- Create: `electron/preload/preload.ts`

**Interfaces:**
- Consumes: Electron Main Process aus Task 3
- Produces: contextBridge API für Renderer

- [ ] **Schritt 1: Preload Script erstellen**

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

- [ ] **Schritt 2: TypeScript Declaration für Electron API erstellen**

```typescript
// src/app/electron-api.d.ts
interface ElectronAPI {
  accounts: {
    getAll: () => Promise<any[]>;
    getById: (id: number) => Promise<any>;
    create: (account: any) => Promise<any>;
    update: (id: number, account: any) => Promise<any>;
    delete: (id: number) => Promise<void>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
```

- [ ] **Schritt 3: Commit**

```bash
git add .
git commit -m "feat: Preload Script + Electron API types"
```

---

## Task 5: IPC Handler erstellen

**Files:**
- Create: `electron/ipc/accounts.ipc.ts`
- Create: `electron/database/accounts.ts`

**Interfaces:**
- Consumes: Preload Script aus Task 4
- Produces: IPC Handler für Accounts

- [ ] **Schritt 1: Accounts Database Modul erstellen (Platzhalter)**

```typescript
// electron/database/accounts.ts
export const accounts = {
  getAll: async () => {
    // TODO: Implementierung mit better-sqlite3
    return [];
  },
  getById: async (id: number) => {
    // TODO: Implementierung mit better-sqlite3
    return null;
  },
  create: async (account: any) => {
    // TODO: Implementierung mit better-sqlite3
    return { id: 1, ...account };
  },
  update: async (id: number, account: any) => {
    // TODO: Implementierung mit better-sqlite3
    return { id, ...account };
  },
  delete: async (id: number) => {
    // TODO: Implementierung mit better-sqlite3
  }
};
```

- [ ] **Schritt 2: Accounts IPC Handler erstellen**

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

- [ ] **Schritt 3: IPC Handler in Main Process registrieren**

```typescript
// electron/main.ts (ergänzen)
import { registerAccountsIPC } from './ipc/accounts.ipc';

function createWindow() {
  // ... existing code ...

  // IPC Handler registrieren
  registerAccountsIPC();
}
```

- [ ] **Schritt 4: Commit**

```bash
git add .
git commit -m "feat: IPC Handler für Accounts"
```

---

## Task 6: Build & Test Setup

**Files:**
- Modify: `package.json`
- Create: `.gitignore`

**Interfaces:**
- Consumes: Alle vorherigen Tasks
- Produces: Funktionierendes Build & Test Setup

- [ ] **Schritt 1: .gitignore erstellen**

```gitignore
# Dependencies
node_modules/

# Build outputs
dist/
dist-electron/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Electron
*.log
```

- [ ] **Schritt 2: Angular Build für Electron anpassen**

```json
// angular.json - production configuration
{
  "projects": {
    "slowen": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "outputPath": "dist/slowen",
              "index": "src/index.html",
              "main": "src/main.ts",
              "polyfills": ["zone.js"],
              "tsConfig": "tsconfig.app.json",
              "assets": [],
              "styles": ["src/styles.scss"],
              "scripts": []
            }
          }
        }
      }
    }
  }
}
```

- [ ] **Schritt 3: Test Setup prüfen**

```bash
ng test --watch=false --browsers=ChromeHeadless
```

- [ ] **Schritt 4: Build testen**

```bash
ng build --configuration production
```

- [ ] **Schritt 5: Commit**

```bash
git add .
git commit -m "feat: Build & Test Setup"
```

---

## Zusammenfassung

**6 Tasks** für vollständiges Electron-Setup:
1. ✅ Angular Projekt + Tailwind
2. ✅ Electron Dependencies
3. ✅ Electron Main Process
4. ✅ Preload Script
5. ✅ IPC Handler
6. ✅ Build & Test

**Testbar nach Task 6:** `npm start` startet Electron mit Angular Dev Server
