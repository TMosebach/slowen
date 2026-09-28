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

  it('should return error if electronAPI is not available', async () => {
    const result = await service.createBackup();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Electron API ist nicht verfügbar.');
  });

  it('should call electronAPI.backup.create when available', async () => {
    const mockBackupApi = {
      create: vi.fn().mockResolvedValue({ success: true, filePath: '/tmp/Backup_2026-09-28_12-00-00.slowen' })
    };
    (window as any).electronAPI = { backup: mockMockApi(mockBackupApi) };

    const result = await service.createBackup();
    expect(result.success).toBe(true);
    expect(result.filePath).toBe('/tmp/Backup_2026-09-28_12-00-00.slowen');
    expect(mockBackupApi.create).toHaveBeenCalled();
  });
});

function mockMockApi(api: any) {
  return api;
}
