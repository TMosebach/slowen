import { Buchung } from "../../domain/buchung";
import { BuchungArt } from "../../domain/buchung-art";
import { Umsatz } from "../../domain/umsatz";

export function transformToBuchung(formular: any): Buchung {
    switch (formular.art) {
        case 'Kauf':
          return createKauf(formular);
      
        default:
            const message = `Unbekannte Buchungsart: ${formular.art}`;
            console.error(message);
            throw { message };
      }
}

/**
 * Formulareingaben in eine Buchung transformieren.
 * 
 * @param formular 
 * @returns Kauf aus Formular
 */
export function createKauf(formular: any): Buchung {
    const buchung: Buchung = {
        art: BuchungArt.Kauf,
        datum: formular.datum,
        beschreibung: 'Kauf '+formular.asset,
        umsaetze: []
    };
    const umsaetze = buchung.umsaetze;

    const menge = Number.parseFloat(formular.menge);
    let betrag = Number.parseFloat(formular.preis) * menge;

    let depotUmsatz = createUmsatz(formular.depot, formular.valuta, betrag, formular.waehrung);
    depotUmsatz.asset = formular.asset;
    depotUmsatz.menge = {
        menge: menge,
        einheit: formular.einheit
    }
    umsaetze?.push(depotUmsatz);

    // Kosten und Steuern
    formular.umsaetze.forEach( (umsatz: any) => {
        umsaetze?.push( createUmsatz(umsatz.konto, formular.valuta, Number.parseFloat(umsatz.betrag), umsatz.waehrung) );
        betrag += Number.parseFloat(umsatz.betrag);
    });

    // Verrechnungsumsatz
    umsaetze?.push( createUmsatz(formular.verrechnungskonto, formular.valuta, -betrag, formular.waehrung) );

    return buchung;
    }

function createUmsatz(konto: string, valuta: string, betrag: number, waehrung: string): Umsatz {
    return {
        konto: konto,
        valuta: valuta,
        betrag: {
        betrag: betrag,
        waehrung: waehrung
        }
    };
}
