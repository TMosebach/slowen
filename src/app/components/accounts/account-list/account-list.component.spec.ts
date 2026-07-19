import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AccountListComponent } from './account-list.component';
import { AccountService } from '../../../services/account.service';

describe('AccountListComponent', () => {
  let component: AccountListComponent;
  let fixture: ComponentFixture<AccountListComponent>;
  let mockService: any;

  const mockAccounts = [
    { id: 1, name: 'Girokonto', type: 'Bestand', subtype: 'Giro' },
    { id: 2, name: 'Tagesgeld', type: 'Bestand', subtype: 'Tagesgeld' },
  ];

  beforeEach(async () => {
    mockService = {
      getAll: vi.fn().mockResolvedValue(mockAccounts),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [AccountListComponent],
      providers: [
        provideRouter([]),
        { provide: AccountService, useValue: mockService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load accounts on init', () => {
    expect(component.accounts.length).toBe(2);
    expect(component.accounts[0].name).toBe('Girokonto');
    expect(component.loading).toBeFalsy();
  });

  it('should not call service.delete when deleteAccount is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    await component.deleteAccount(1);
    expect(mockService.delete).not.toHaveBeenCalled();
  });

  it('should call service.delete when deleteAccount is confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await component.deleteAccount(1);
    expect(mockService.delete).toHaveBeenCalledWith(1);
    expect(mockService.getAll).toHaveBeenCalled();
  });
});
