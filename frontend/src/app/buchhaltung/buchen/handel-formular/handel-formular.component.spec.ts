import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { BuchhaltungService } from '../../buchhaltung.service';
import { Buchung } from '../../domain/buchung';
import { BuchungArt } from '../../domain/buchung-art';

import { HandelFormularComponent } from './handel-formular.component';

const formVorlage = {
  art: '',
  datum: '2022-02-25',
  asset: 'Talanx',
  depot: 'Depot',
  menge: 100,
  einheit: 'St.',
  preis: 24,
  waehrung: 'EUR',
  verrechnungskonto: 'Giro',
  valuta: '2022-02-25',
  provision: '',
  maklercourtage: '',
  boersenplatzentgeld: '',
  spesen: '',
  sonstigeKosten: '',
  kapitalertragssteuer: '',
  solidaritaetszuschlag: ''
}

describe('HandelFormularComponent', () => {
  let component: HandelFormularComponent;
  let fixture: ComponentFixture<HandelFormularComponent>;
  let buchhaltungService: any;

  beforeEach(() => {

    buchhaltungService = {
      getKonten: () => of([]),
      buche: (buchung: Buchung) => of(buchung)
    };

    spyOn(buchhaltungService, 'buche').and.callThrough();

    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      declarations: [ HandelFormularComponent ],
      providers: [
        {
          provide: BuchhaltungService,
          useValue: buchhaltungService
        }
      ]
    });

    fixture = TestBed.createComponent(HandelFormularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should deliver Kauf-Buchung', () => {
    component.buchenForm?.setValue({
      ...formVorlage,
      art: 'Kauf',
      provision: '30.0'
    });
    component.doBuche();
    
    expect(buchhaltungService.buche).toHaveBeenCalledWith(getExpectedKauf());
  });

  it('should deliver Verkauf-Buchung', () => {
    component.buchenForm?.setValue({
      ...formVorlage,
      art: 'Verkauf',
      provision: '30.0',
      menge: -100,
      preis: 30
    });
    component.doBuche();
    
    expect(buchhaltungService.buche).toHaveBeenCalledWith(getExpectedVerkauf());
  });

  it('should deliver Einlieferung-Buchung', () => {
    component.buchenForm?.setValue({
      ...formVorlage,
      art: 'Einlieferung',
      menge: 100,
      preis: 24
    });
    component.doBuche();
    
    expect(buchhaltungService.buche).toHaveBeenCalledWith(getExpectedEinlieferung());
  });
});

function getExpectedEinlieferung(): Buchung {
  return {
    art: BuchungArt.Einlieferung,
    datum: '2022-02-25',
    beschreibung: 'Einlieferung Talanx',
    umsaetze: [
      {
        konto: {
          name: 'Depot'
        },
        valuta: '2022-02-25',
        betrag: {
          betrag: 2400, 
          waehrung: 'EUR'
        },
        asset: 'Talanx',
        menge: {
          menge: 100, 
          einheit: 'St.'
        }
      }
    ]
  }
}

function getExpectedVerkauf(): Buchung {
  return {
    art: BuchungArt.Verkauf,
    datum: '2022-02-25',
    beschreibung: 'Verkauf Talanx',
    umsaetze: [
      {
        konto: {
          name: 'Depot'
        },
        valuta: '2022-02-25',
        betrag: {
          betrag: -3000, 
          waehrung: 'EUR'
        },
        asset: 'Talanx',
        menge: {
          menge: -100, 
          einheit: 'St.'
        }
      },
      {
        konto: {
          name: 'Provision'
        },
        valuta: '2022-02-25',
        betrag: {
          betrag: 30, 
          waehrung: 'EUR'
        }
      },
      {
        konto: {
          name: 'Giro'
        },
        valuta: '2022-02-25',
        betrag: {
          betrag: 2970, 
          waehrung: 'EUR'
        }
      }
    ]
  };  
}

function getExpectedKauf(): Buchung {
  return {
    art: BuchungArt.Kauf,
    datum: '2022-02-25',
    beschreibung: 'Kauf Talanx',
    umsaetze: [
      {
        konto: {
          name: 'Depot'
        },
        valuta: '2022-02-25',
        betrag: {
          betrag: 2400, 
          waehrung: 'EUR'
        },
        asset: 'Talanx',
        menge: {
          menge: 100, 
          einheit: 'St.'
        }
      },
      {
        konto: {
          name: 'Provision'
        },
        valuta: '2022-02-25',
        betrag: {
          betrag: 30, 
          waehrung: 'EUR'
        }
      },
      {
        konto: {
          name: 'Giro'
        },
        valuta: '2022-02-25',
        betrag: {
          betrag: -2430, 
          waehrung: 'EUR'
        }
      }
    ]
  };
}
