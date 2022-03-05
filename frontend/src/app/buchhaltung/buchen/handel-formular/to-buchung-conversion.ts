import { Buchung } from "../../domain/buchung";
import { BuchungArt } from "../../domain/buchung-art";
import { Umsatz } from "../../domain/umsatz";

export function transformToBuchung(formular: any): Buchung {
    switch (formular.art) {
        case 'Kauf':
            return createAssetBuchung(BuchungArt.Kauf, formular);
        case 'Verkauf':
            return createAssetBuchung(BuchungArt.Verkauf, formular);
        case 'Einlieferung':
            return createEinlieferung(formular);

        default:
            const message = `Unbekannte Buchungsart: ${formular.art}`;
            console.error(message);
            throw { message };
      }
}

function createEinlieferung(formular: any): Buchung {
    const buchung = createBasisBuchung(BuchungArt.Einlieferung, formular.datum, formular.asset);
    const umsaetze = buchung.umsaetze;

    const menge = Number.parseFloat(formular.menge);
    let betrag = Number.parseFloat(formular.preis) * menge;

    umsaetze?.push(createDepotUmsatz(formular, betrag, menge));
    return buchung;
}

function createAssetBuchung(art: BuchungArt, formular: any): Buchung {
    const buchung = createBasisBuchung(art, formular.datum, formular.asset);
    const umsaetze = buchung.umsaetze;

    const menge = Number.parseFloat(formular.menge);
    let betrag = Number.parseFloat(formular.preis) * menge;

    umsaetze?.push(createDepotUmsatz(formular, betrag, menge));

    // Kosten und Steuern
    formular.umsaetze.forEach( (umsatz: any) => {
        umsaetze?.push( createUmsatz(umsatz.konto, formular.valuta, Number.parseFloat(umsatz.betrag), umsatz.waehrung) );
        betrag += Number.parseFloat(umsatz.betrag);
    });

    // Verrechnungsumsatz
    umsaetze?.push( createUmsatz(formular.verrechnungskonto, formular.valuta, -betrag, formular.waehrung) );

    return buchung;
}

function createDepotUmsatz(formular: any, betrag:number, menge: number): Umsatz {
    let depotUmsatz = createUmsatz(formular.depot, formular.valuta, betrag, formular.waehrung);
    depotUmsatz.asset = formular.asset;
    depotUmsatz.menge = {
        menge: menge,
        einheit: formular.einheit
    }
    return depotUmsatz;
}

function createBasisBuchung(art: BuchungArt, datum: string, asset: string): Buchung {
    return {
        art: art,
        datum: datum,
        beschreibung: `${art} ` +asset,
        umsaetze: []
    };
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
