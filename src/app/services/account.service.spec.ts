import { TestBed } from '@angular/core/testing';
import { AccountService } from './account.service';

describe('AccountService', () => {
  let service: AccountService;
  let mockApi: any;

  beforeEach(() => {
    mockApi = {
      getAll: vi.fn().mockResolvedValue([]),
      getById: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation((a: any) => Promise.resolve({ id: 1, ...a })),
      update: vi.fn().mockImplementation((id: number, a: any) => Promise.resolve({ id, ...a })),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    (window as any).electronAPI = { accounts: mockApi };

    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call api.getAll on getAll()', async () => {
    const result = await service.getAll();
    expect(mockApi.getAll).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should call api.getById with correct id', async () => {
    const mockAccount = { id: 5, name: 'Test', type: 'Bestand', subtype: 'Giro' };
    mockApi.getById.mockResolvedValue(mockAccount);

    const result = await service.getById(5);
    expect(mockApi.getById).toHaveBeenCalledWith(5);
    expect(result).toEqual(mockAccount);
  });

  it('should call api.create with account data', async () => {
    const account = { name: 'Neues Konto', type: 'Bestand' as const, subtype: 'Giro' };
    const result = await service.create(account);
    expect(mockApi.create).toHaveBeenCalledWith(account);
    expect(result.id).toBe(1);
  });

  it('should call api.update with id and account data', async () => {
    const account = { name: 'Update', type: 'GuV' as const, subtype: 'Kreditkarte' };
    const result = await service.update(3, account);
    expect(mockApi.update).toHaveBeenCalledWith(3, account);
    expect(result.id).toBe(3);
  });

  it('should call api.delete with id', async () => {
    await service.delete(7);
    expect(mockApi.delete).toHaveBeenCalledWith(7);
  });
});
