import { dialog, ipcMain } from 'electron';
import * as fs from 'fs';
import { backup } from '../database/backup';

export function getBackupFilename(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  return `Backup_${dateStr}_${timeStr}.slowen`;
}

export interface BackupResult {
  success: boolean;
  canceled?: boolean;
  filePath?: string;
  error?: string;
}

export function registerBackupIPC() {
  ipcMain.handle('backup:create', async (): Promise<BackupResult> => {
    try {
      const defaultPath = getBackupFilename();
      const { filePath, canceled } = await dialog.showSaveDialog({
        title: 'Backup speichern',
        defaultPath,
        filters: [{ name: 'Slowen Backup (*.slowen)', extensions: ['slowen'] }]
      });

      if (canceled || !filePath) {
        return { success: false, canceled: true };
      }

      const backupData = await backup.export();
      fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf-8');

      return { success: true, filePath };
    } catch (error: any) {
      console.error('IPC backup:create failed:', error);
      return { success: false, error: error?.message || String(error) };
    }
  });
}
