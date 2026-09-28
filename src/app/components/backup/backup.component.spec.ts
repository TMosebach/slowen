import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BackupComponent } from './backup.component';
import { BackupService } from '../../services/backup.service';

describe('BackupComponent', () => {
  let component: BackupComponent;
  let fixture: ComponentFixture<BackupComponent>;
  let mockBackupService: {
    createBackup: ReturnType<typeof vi.fn>;
    restoreBackup: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockBackupService = {
      createBackup: vi.fn(),
      restoreBackup: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [BackupComponent],
      providers: [
        { provide: BackupService, useValue: mockBackupService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BackupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('displays button "Neues Backup erstellen" and "Backup auswählen und einspielen"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Neues Backup erstellen');
    expect(compiled.textContent).toContain('Backup auswählen und einspielen');
  });

  it('shows success message and file path on successful backup creation', async () => {
    const fakePath = '/tmp/Backup_2026-09-28_14-30-00.slowen';
    mockBackupService.createBackup.mockResolvedValue({
      success: true,
      filePath: fakePath
    });

    await component.createBackup();
    fixture.detectChanges();

    expect(component.successMessage).toBe('Das Backup wurde erfolgreich erstellt.');
    expect(component.savedFilePath).toBe(fakePath);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Das Backup wurde erfolgreich erstellt.');
    expect(compiled.textContent).toContain(fakePath);
  });

  it('handles error message when backup creation fails', async () => {
    mockBackupService.createBackup.mockResolvedValue({
      success: false,
      error: 'Schreibfehler'
    });

    await component.createBackup();
    fixture.detectChanges();

    expect(component.errorMessage).toContain('Schreibfehler');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Schreibfehler');
  });

  it('opens modal on restore click, and restores backup when confirmed', async () => {
    const fakePath = '/tmp/Backup_2026-09-28_10-00-00.slowen';
    mockBackupService.restoreBackup.mockResolvedValue({
      success: true,
      filePath: fakePath
    });

    component.openRestoreModal();
    fixture.detectChanges();

    expect(component.showRestoreConfirmModal).toBe(true);
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Backup einspielen bestätigen');

    await component.confirmAndRestore();
    fixture.detectChanges();

    expect(component.showRestoreConfirmModal).toBe(false);
    expect(component.restoreSuccessMessage).toBe('Das Backup wurde erfolgreich eingespielt.');
    expect(component.restoreFilePath).toBe(fakePath);

    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Das Backup wurde erfolgreich eingespielt.');
  });

  it('handles error when restoring backup fails', async () => {
    mockBackupService.restoreBackup.mockResolvedValue({
      success: false,
      error: 'Ungültiges JSON'
    });

    await component.confirmAndRestore();
    fixture.detectChanges();

    expect(component.restoreErrorMessage).toContain('Ungültiges JSON');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Ungültiges JSON');
  });

  it('cancels modal when user aborts', () => {
    component.openRestoreModal();
    fixture.detectChanges();
    expect(component.showRestoreConfirmModal).toBe(true);

    component.cancelRestoreModal();
    fixture.detectChanges();
    expect(component.showRestoreConfirmModal).toBe(false);
  });
});
