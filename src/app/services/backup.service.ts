import { Injectable } from '@angular/core';

export interface BackupResponse {
  success: boolean;
  canceled?: boolean;
  filePath?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class BackupService {
  private get api() {
    return window.electronAPI?.backup;
  }

  createBackup(): Promise<BackupResponse> {
    if (!this.api) {
      return Promise.resolve({
        success: false,
        error: 'Electron API ist nicht verfügbar.'
      });
    }
    return this.api.create();
  }

  restoreBackup(): Promise<BackupResponse> {
    if (!this.api) {
      return Promise.resolve({
        success: false,
        error: 'Electron API ist nicht verfügbar.'
      });
    }
    return this.api.restore();
  }
}
