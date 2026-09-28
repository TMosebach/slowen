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
        // User canceled the dialog - reset state cleanly
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
}
