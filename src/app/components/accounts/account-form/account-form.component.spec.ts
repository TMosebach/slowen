import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { AccountFormComponent } from './account-form.component';
import { AccountService } from '../../../services/account.service';

describe('AccountFormComponent', () => {
  let component: AccountFormComponent;
  let fixture: ComponentFixture<AccountFormComponent>;
  let mockService: any;
  async function setup(routeId: string | null = null, getAccount: any = null) {
    mockService = {
      create: vi.fn().mockImplementation((a: any) => Promise.resolve({ id: 1, ...a })),
      update: vi.fn().mockImplementation((id: number, a: any) => Promise.resolve({ id, ...a })),
      getById: vi.fn().mockResolvedValue(getAccount),
    };

    const snapshot: any = {
      paramMap: {
        get: (key: string) => (key === 'id' ? routeId : null),
      },
    };

    await TestBed.configureTestingModule({
      imports: [AccountFormComponent],
      providers: [
        provideRouter([{ path: 'accounts', component: AccountFormComponent }]),
        { provide: AccountService, useValue: mockService },
        { provide: ActivatedRoute, useValue: { snapshot } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('should create in create mode', async () => {
    await setup();
    expect(component).toBeTruthy();
    expect(component.isEditing).toBeFalsy();
    expect(component.account.name).toBe('');
    expect(component.account.type).toBe('Bestand');
  });

  it('should set isEditing when route has id', async () => {
    const mockAccount = { id: 5, name: 'Existing', type: 'Bestand', subtype: 'Giro', iban: 'DE123' };
    await setup('5', mockAccount);
    expect(component.isEditing).toBeTruthy();
    expect(component.accountId).toBe(5);
  });

  it('should load account data in edit mode', async () => {
    const mockAccount = { id: 5, name: 'Existing', type: 'GuV', subtype: 'Kreditkarte' };
    await setup('5', mockAccount);
    expect(component.account.name).toBe('Existing');
    expect(component.account.type).toBe('GuV');
  });

  it('should update subtypes when type changes', async () => {
    await setup();
    expect(component.subtypes).toContain('Giro');

    component.account.type = 'GuV';
    component.updateSubtypes();
    expect(component.subtypes).toContain('Kreditkarte');
    expect(component.subtypes).not.toContain('Giro');
  });

  it('should show iban field only for Bestand subtypes with iban', async () => {
    await setup();
    component.account.type = 'Bestand';
    component.account.subtype = 'Giro';
    expect(component.showIbanField()).toBeTruthy();

    component.account.subtype = 'Immobilie';
    expect(component.showIbanField()).toBeFalsy();

    component.account.type = 'GuV';
    component.account.subtype = 'Kreditkarte';
    expect(component.showIbanField()).toBeFalsy();
  });

  it('should call create on submit with valid data', async () => {
    await setup();
    vi.spyOn(window, 'alert');
    const navigateSpy = vi.spyOn(component['router'], 'navigate');

    component.account.name = 'Neues Konto';
    component.account.subtype = 'Giro';
    await component.onSubmit();

    expect(mockService.create).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/accounts']);
  });

  it('should show alert if name is too short', async () => {
    await setup();
    vi.spyOn(window, 'alert');

    component.account.name = 'AB';
    component.account.subtype = 'Giro';
    await component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Name muss mindestens 3 Zeichen lang sein.');
    expect(mockService.create).not.toHaveBeenCalled();
  });

  it('should show alert if subtype is empty', async () => {
    await setup();
    vi.spyOn(window, 'alert');

    component.account.name = 'Gültiger Name';
    component.account.subtype = '';
    await component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Bitte wählen Sie einen Subtyp.');
    expect(mockService.create).not.toHaveBeenCalled();
  });
});
