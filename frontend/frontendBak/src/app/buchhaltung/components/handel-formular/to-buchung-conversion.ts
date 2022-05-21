import { Buchung } from "../../domain/buchung";
import { BuchungArt } from "../../domain/buchung-art";
import { Umsatz } from "../../domain/umsatz";
import { HandelFormular } from "./handel-formular";

export function transformToBuchung(formular: HandelFormular): Buchung {
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

function createAssetBuchung(art: BuchungArt, formular: HandelFormular): Buchung {
    const buchung = createBasisBuchung(art, formular.datum, formular.asset);
    const umsaetze = buchung.umsaetze;

    const menge = Number.parseFloat(formular.menge);
    let betrag = Number.parseFloat(formular.preis) * menge;

    umsaetze?.push(createDepotUmsatz(formular, betrag, menge));

    betrag += checkAndCreateUmsatz('Provision', formular, formular.provision, umsaetze);
    betrag += checkAndCreateUmsatz('Maklercourtage', formular, formular.maklercourtage, umsaetze);
    betrag += checkAndCreateUmsatz('Börsenplatzentgeld', formular, formular.boersenplatzentgeld, umsaetze);
    betrag += checkAndCreateUmsatz('Spesen', formular, formular.spesen, umsaetze);
    betrag += checkAndCreateUmsatz('sonstige Kosten', formular, formular.sonstigeKosten, umsaetze);
    betrag += checkAndCreateUmsatz('Kapitalertragssteuer', formular, formular.kapitalertragssteuer, umsaetze);
    betrag += checkAndCreateUmsatz('Solidaritätszuschlag', formular, formular.solidaritaetszuschlag, umsaetze);

    umsaetze?.push( createUmsatz(formular.verrechnungskonto, formular.valuta, -betrag, formular.waehrung) );

    return buchung;
}

function checkAndCreateUmsatz(konto: string, formular: HandelFormular, formularBetrag: string, umsaetze: Umsatz[] | undefined) {
    if (formularBetrag && formularBetrag.length > 0) {
        const betrag = Number.parseFloat(formularBetrag);
        umsaetze?.push( createUmsatz(konto, formular.valuta, betrag, formular.waehrung));
        return betrag;
    }
    return 0;
}

function createDepotUmsatz(formular: HandelFormular, betrag:number, menge: number): Umsatz {
    let depotUmsatz = createUmsatz(formular.depot, formular.valuta, betrag, formular.waehrung);
    depotUmsatz.asset = {
        name: formular.asset
    };
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
        konto: {
            name: konto
        },
        valuta: valuta,
        betrag: {
        betrag: betrag,
        waehrung: waehrung
        }
    };
}
