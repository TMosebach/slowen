import { HandelFormular } from './handel-formular';
import { transformToBuchung } from './to-buchung-conversion';

describe('ToBuchungConversion', () => {
  it('should create an instance', () => {
    expect(transformToBuchung).toBeTruthy();
  });

  it('should generate minimum Kauf', () => {

    const formular = prepareFormular();

    const result = transformToBuchung(formular);

    // Depot- und Giro-Umsatz, keine Kosten
    expect(result.umsaetze?.length).toBe(2);
  });

  it('should generate Kauf with Provision', () => {
    const formular = prepareFormular();
    formular.provision = '30.0';

    const result = transformToBuchung(formular);

    // Depot- und Giro-Umsatz sowie Provision
    expect(result.umsaetze?.length).toBe(3);
  });
});

function prepareFormular(): HandelFormular {
  return {
    art: 'Kauf',
    datum: '2022-03-11',
    asset: 'Talanx AG',
    depot: 'Depot',
    menge: '100.0',
    einheit: 'St.',
    preis: '24.0',
    valuta: '2022-03-11',
    verrechnungskonto: 'Giro',
    waehrung: 'EUR',
    provision: '',
    maklercourtage: '',
    boersenplatzentgeld: '',
    spesen: '',
    sonstigeKosten: '',
    kapitalertragssteuer: '',
    solidaritaetszuschlag: ''
  };
}
