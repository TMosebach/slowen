import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackupService } from '../../services/backup.service';

@Component({
  selector: 'app-backup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './backup.component.html'
})
export class BackupComponent {
  isCreating = false;
  successMessage: string | null = null;
  savedFilePath: string | null = null;
  errorMessage: string | null = null;

  isRestoring = false;
  showRestoreConfirmModal = false;
  restoreSuccessMessage: string | null = null;
  restoreFilePath: string | null = null;
  restoreErrorMessage: string | null = null;

  constructor(
    private backupService: BackupService,
    private cdr: ChangeDetectorRef
  ) {}

  async createBackup(): Promise<void> {
    this.isCreating = true;
    this.successMessage = null;
    this.savedFilePath = null;
    this.errorMessage = null;

    try {
      const result = await this.backupService.createBackup();

      if (result.success && result.filePath) {
        this.successMessage = 'Das Backup wurde erfolgreich erstellt.';
        this.savedFilePath = result.filePath;
      } else if (result.canceled) {
        // User canceled dialog cleanly
      } else if (result.error) {
        this.errorMessage = `Fehler beim Erstellen des Backups: ${result.error}`;
      }
    } catch (err: any) {
      this.errorMessage = `Unerwarteter Fehler: ${err?.message || String(err)}`;
    } finally {
      this.isCreating = false;
      this.cdr.markForCheck();
    }
  }

  openRestoreModal(): void {
    this.restoreSuccessMessage = null;
    this.restoreFilePath = null;
    this.restoreErrorMessage = null;
    this.showRestoreConfirmModal = true;
    this.cdr.markForCheck();
  }

  cancelRestoreModal(): void {
    this.showRestoreConfirmModal = false;
    this.cdr.markForCheck();
  }

  async confirmAndRestore(): Promise<void> {
    this.showRestoreConfirmModal = false;
    this.isRestoring = true;
    this.cdr.markForCheck();
    this.restoreSuccessMessage = null;
    this.restoreFilePath = null;
    this.restoreErrorMessage = null;

    try {
      const result = await this.backupService.restoreBackup();

      if (result.success && result.filePath) {
        this.restoreSuccessMessage = 'Das Backup wurde erfolgreich eingespielt.';
        this.restoreFilePath = result.filePath;
      } else if (result.canceled) {
        // User canceled file dialog
      } else if (result.error) {
        this.restoreErrorMessage = `Fehler beim Einspielen des Backups: ${result.error}`;
      }
    } catch (err: any) {
      this.restoreErrorMessage = `Unerwarteter Fehler: ${err?.message || String(err)}`;
    } finally {
      this.isRestoring = false;
      this.cdr.markForCheck();
    }
  }
}
