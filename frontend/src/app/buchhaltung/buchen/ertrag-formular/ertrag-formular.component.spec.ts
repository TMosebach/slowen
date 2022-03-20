import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { BuchhaltungService } from '../../buchhaltung.service';
import { Buchung } from '../../domain/buchung';
import { BuchungArt } from '../../domain/buchung-art';

import { ErtragFormularComponent } from './ertrag-formular.component';

describe('ErtragFormularComponent', () => {

  const formVorlage = {
    datum: '2022-02-25',
    depot: 'Depot',
    asset: 'Talanx AG',
    ertragsart: 'Dividende',
    valuta: '2022-02-25',
    verrechnungskonto: 'Giro',
    ertrag: '300',
    waehrung: 'EUR',
    kapitalertragssteuer: '',
    solidaritaetszuschlag: '',
  }

  let component: ErtragFormularComponent;
  let fixture: ComponentFixture<ErtragFormularComponent>;
  let buchhaltungService: any;

  beforeEach(() => {

    buchhaltungService = {
      buche: (buchung: Buchung) => of(buchung)
    };

    spyOn(buchhaltungService, 'buche').and.callThrough();

    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      declarations: [ ErtragFormularComponent ],
      providers: [
        {
          provide: BuchhaltungService,
          useValue: buchhaltungService
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErtragFormularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should liefern Dividenden-Buchung ohne Steuer', () => {
    component.buchenForm?.setValue({
      ...formVorlage
    });
    component.doBuche();
    
    expect(buchhaltungService.buche).toHaveBeenCalledWith(getExpectedSteuerfreieDividende());
  });
});

function getExpectedSteuerfreieDividende(): Buchung {
  return {
    art: BuchungArt.Ertrag,
    datum: '2022-02-25',
    beschreibung: 'Dividende Talanx AG',
    umsaetze: [
      {
        konto: {
          name: 'Depot'
        },
        valuta: '2022-02-25',
        betrag: {
          betrag: 0.0, 
          waehrung: 'EUR'
        },
        asset: 'Talanx AG',
        menge: {
          menge: 0.0, 
          einheit: 'St.'
        }
      },
      {
        konto: {
          name: 'Dividende'
        },
        valuta: '2022-02-25',
        betrag: {
          betrag: -300, 
          waehrung: 'EUR'
        }
      },
      {
        konto: {
          name: 'Giro'
        },
        valuta: '2022-02-25',
        betrag: {
          betrag: 300, 
          waehrung: 'EUR'
        }
      }
    ]
  };
}
