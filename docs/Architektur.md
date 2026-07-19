# Architektur

Erstellen einer Desktop-Applikaiton zur persönlichen Finanzverwaltung mit Namen "Slowen"
mit Konten, Transaktionen, Wertpapieren, CSV-Import und Reports.

Das System läuft auf einem Deutschen Rechner auf einem Mac OS.

## Architecture:
Electron Main Process mit better-sqlite3 und CRUD-Modulen; Angular 19 Renderer mit Tailwind CSS; Kommunikation via IPC (contextBridge/preload.ts); Chart.js via ng2-charts für Reports.

## Tech Stack:

* Electron
* Angular 19, TypeScript, 
* Tailwind CSS v4, 
* better-sqlite3, 
* Chart.js/ng2-charts, 
* electron-builder, 
* Jasmine/Karma