import { TestBed } from '@angular/core/testing';
import { BackupService } from './backup.service';

describe('BackupService', () => {
  let service: BackupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return error if electronAPI is not available for createBackup', async () => {
    (window as any).electronAPI = undefined;
    const result = await service.createBackup();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Electron API ist nicht verfügbar.');
  });

  it('should return error if electronAPI is not available for restoreBackup', async () => {
    (window as any).electronAPI = undefined;
    const result = await service.restoreBackup();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Electron API ist nicht verfügbar.');
  });

  it('should call electronAPI.backup.create when available', async () => {
    const mockBackupApi = {
      create: vi.fn().mockResolvedValue({ success: true, filePath: '/tmp/Backup_2026-09-28_12-00-00.slowen' }),
      restore: vi.fn()
    };
    (window as any).electronAPI = { backup: mockBackupApi };

    const result = await service.createBackup();
    expect(result.success).toBe(true);
    expect(result.filePath).toBe('/tmp/Backup_2026-09-28_12-00-00.slowen');
    expect(mockBackupApi.create).toHaveBeenCalled();
  });

  it('should call electronAPI.backup.restore when available', async () => {
    const mockBackupApi = {
      create: vi.fn(),
      restore: vi.fn().mockResolvedValue({ success: true, filePath: '/tmp/Backup_2026-09-28_12-00-00.slowen' })
    };
    (window as any).electronAPI = { backup: mockBackupApi };

    const result = await service.restoreBackup();
    expect(result.success).toBe(true);
    expect(result.filePath).toBe('/tmp/Backup_2026-09-28_12-00-00.slowen');
    expect(mockBackupApi.restore).toHaveBeenCalled();
  });
});
