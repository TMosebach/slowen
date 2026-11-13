import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { SecuritiesFormComponent } from './securities-form.component';
import { SecuritiesService } from '../../../services/securities.service';
import { Security } from '../../../models/security.model';

describe('SecuritiesFormComponent', () => {
  let component: SecuritiesFormComponent;
  let fixture: ComponentFixture<SecuritiesFormComponent>;
  let mockSecuritiesService: any;

  async function setup(routeId: string | null = null, existingSecurity: Security | null = null) {
    mockSecuritiesService = {
      create: vi.fn().mockImplementation((s: Security) => Promise.resolve({ id: 1, ...s })),
      update: vi.fn().mockImplementation((id: number, s: Security) => Promise.resolve({ id, ...s })),
      getById: vi.fn().mockResolvedValue(existingSecurity)
    };

    vi.spyOn(window, 'alert').mockImplementation(() => {});

    const snapshot: any = {
      paramMap: {
        get: (key: string) => (key === 'id' ? routeId : null)
      }
    };

    await TestBed.configureTestingModule({
      imports: [SecuritiesFormComponent],
      providers: [
        provideRouter([{ path: 'securities', component: SecuritiesFormComponent }]),
        { provide: SecuritiesService, useValue: mockSecuritiesService },
        { provide: ActivatedRoute, useValue: { snapshot } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SecuritiesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('should initialize with default values for new security', async () => {
    await setup();
    expect(component).toBeTruthy();
    expect(component.isEditing).toBe(false);
    expect(component.security.type).toBe('Aktie');
    expect(component.showFaelligkeit).toBe(false);
  });

  it('shows faelligkeit field for Anleihe and Zertifikat', async () => {
    await setup();
    component.security.type = 'Anleihe';
    component.updateFaelligkeitVisibility();
    expect(component.showFaelligkeit).toBe(true);

    component.security.type = 'Zertifikat';
    component.updateFaelligkeitVisibility();
    expect(component.showFaelligkeit).toBe(true);

    component.security.type = 'Aktie';
    component.updateFaelligkeitVisibility();
    expect(component.showFaelligkeit).toBe(false);
  });

  it('successfully creates an Anleihe without faelligkeit (perpetual bond)', async () => {
    await setup();
    component.security.name = 'Perpetual Bond';
    component.security.type = 'Anleihe';
    component.updateFaelligkeitVisibility();
    component.security.isin = 'DE0001234567';
    component.security.wkn = '123456';
    component.security.faelligkeit = '';

    await component.onSubmit();

    expect(component.errorMessage).toBeNull();
    expect(mockSecuritiesService.create).toHaveBeenCalledWith({
      name: 'Perpetual Bond',
      type: 'Anleihe',
      isin: 'DE0001234567',
      wkn: '123456',
      faelligkeit: ''
    });
  });

  it('successfully creates an Anleihe with faelligkeit', async () => {
    await setup();
    component.security.name = 'Bundesanleihe 2030';
    component.security.type = 'Anleihe';
    component.updateFaelligkeitVisibility();
    component.security.isin = 'DE0001102507';
    component.security.wkn = '110250';
    component.security.faelligkeit = '2030-08-15';

    await component.onSubmit();

    expect(component.errorMessage).toBeNull();
    expect(mockSecuritiesService.create).toHaveBeenCalledWith({
      name: 'Bundesanleihe 2030',
      type: 'Anleihe',
      isin: 'DE0001102507',
      wkn: '110250',
      faelligkeit: '2030-08-15'
    });
  });

  it('clears faelligkeit when switching from Anleihe to Aktie', async () => {
    await setup();
    component.security.name = 'Test Security';
    component.security.type = 'Anleihe';
    component.updateFaelligkeitVisibility();
    component.security.isin = 'US0378331005';
    component.security.wkn = '865985';
    component.security.faelligkeit = '2030-08-15';

    // Switch to Aktie
    component.security.type = 'Aktie';
    component.updateFaelligkeitVisibility();
    expect(component.showFaelligkeit).toBe(false);

    await component.onSubmit();

    expect(component.errorMessage).toBeNull();
    expect(mockSecuritiesService.create).toHaveBeenCalledWith({
      name: 'Test Security',
      type: 'Aktie',
      isin: 'US0378331005',
      wkn: '865985',
      faelligkeit: ''
    });
  });

  it('validates required fields: name, ISIN and WKN', async () => {
    await setup();
    component.security.name = '';
    await component.onSubmit();
    expect(component.errorMessage).toBe('Name ist erforderlich.');

    component.security.name = 'Apple';
    component.security.isin = 'SHORT';
    await component.onSubmit();
    expect(component.errorMessage).toBe('ISIN muss 12 Zeichen sein.');

    component.security.isin = 'US0378331005';
    component.security.wkn = 'SHORT';
    await component.onSubmit();
    expect(component.errorMessage).toBe('WKN muss 6 Zeichen sein.');
  });
});
