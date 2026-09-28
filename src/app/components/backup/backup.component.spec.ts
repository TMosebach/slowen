import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BackupComponent } from './backup.component';
import { BackupService } from '../../services/backup.service';

describe('BackupComponent', () => {
  let component: BackupComponent;
  let fixture: ComponentFixture<BackupComponent>;
  let mockBackupService: { createBackup: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockBackupService = {
      createBackup: vi.fn()
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

  it('displays button "Neues Backup erstellen"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button');
    expect(button?.textContent?.trim()).toContain('Neues Backup erstellen');
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

  it('handles error message when backup fails', async () => {
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

  it('clears message if user cancels backup dialog', async () => {
    mockBackupService.createBackup.mockResolvedValue({
      success: false,
      canceled: true
    });

    await component.createBackup();
    fixture.detectChanges();

    expect(component.successMessage).toBeNull();
    expect(component.errorMessage).toBeNull();
  });
});
