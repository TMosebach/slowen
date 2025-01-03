package de.tmosebach.slowen;

import java.util.List;

import de.tmosebach.slowen.api.input.BuchungWrapper;
import de.tmosebach.slowen.api.input.Einlieferung;
import de.tmosebach.slowen.domain.Asset;
import de.tmosebach.slowen.domain.Buchung;
import de.tmosebach.slowen.domain.DepotUmsatz;
import de.tmosebach.slowen.domain.Konto;
import de.tmosebach.slowen.domain.Umsatz;
import de.tmosebach.slowen.values.Vorgang;

public class DomainApiMapper {

	public static de.tmosebach.slowen.api.types.Konto toApiKonto(Konto domainKonto) {
		de.tmosebach.slowen.api.types.Konto apiKonto = new de.tmosebach.slowen.api.types.Konto();
		apiKonto.setArt(domainKonto.getArt());
		apiKonto.setBilanzPosition(domainKonto.getBilanzPosition());
		apiKonto.setName(domainKonto.getName());
		apiKonto.setWaehrung(domainKonto.getWaehrung());
		return apiKonto;
	}
	
	public static de.tmosebach.slowen.api.input.AssetInput toApiAsset(Asset domainAsset) {
		de.tmosebach.slowen.api.input.AssetInput apiAsset = new de.tmosebach.slowen.api.input.AssetInput();
		apiAsset.setIsin(domainAsset.getIsin());
		apiAsset.setName(domainAsset.getName());
		apiAsset.setTyp(domainAsset.getTyp());
		apiAsset.setWpk(domainAsset.getWpk());
		return apiAsset;
	}
	
	public static BuchungWrapper toApiBuchung(Buchung domainBuchung) {
		Vorgang vorgang = domainBuchung.getVorgang();
		BuchungWrapper buchungWrapper = null;
		switch (vorgang) {
		case Buchung: 
			buchungWrapper = mapBuchung(domainBuchung);
			break;
		case Einlieferung: 
			buchungWrapper =  mapEinlieferung(domainBuchung);
			break;
		case Kauf: 
			buchungWrapper =  mapKauf(domainBuchung);
			break;
		case Ertrag: 
			buchungWrapper =  mapErtrag(domainBuchung);
			break;
		case Verkauf: 
			buchungWrapper =  mapVerkauf(domainBuchung);
			break;
		case Tilgung: 
			buchungWrapper =  mapTilgung(domainBuchung);
			break;
		default:
			throw new IllegalArgumentException("Unexpected value: " + domainBuchung.getVorgang());
		}
		buchungWrapper.setVorgang(vorgang);
		return buchungWrapper;
	}

	// TODO
	private static BuchungWrapper mapTilgung(Buchung domainBuchung) {
		throw new UnsupportedOperationException();
	}

	// TODO
	private static BuchungWrapper mapVerkauf(Buchung domainBuchung) {
		throw new UnsupportedOperationException();
	}

	// TODO
	private static BuchungWrapper mapErtrag(Buchung domainBuchung) {
		throw new UnsupportedOperationException();
	}

	// TODO
	private static BuchungWrapper mapKauf(Buchung domainBuchung) {
		throw new UnsupportedOperationException();
	}

	private static BuchungWrapper mapEinlieferung(Buchung domainBuchung) {
		Einlieferung einlieferung = new Einlieferung();
		einlieferung.setDatum(domainBuchung.getDatum());
		
		DepotUmsatz depotUmsatz = (DepotUmsatz)domainBuchung.getUmsaetze().get(0);
		einlieferung.setAsset(depotUmsatz.getAsset());
		einlieferung.setBetrag(depotUmsatz.getBetrag());
		
		einlieferung.setDepot(depotUmsatz.getKonto());
		einlieferung.setMenge(depotUmsatz.getMenge());
		einlieferung.setValuta(depotUmsatz.getValuta());
		
		BuchungWrapper buchungWrapper = new BuchungWrapper();
		buchungWrapper.setEinlieferung(einlieferung);
		return buchungWrapper;
	}

	private static BuchungWrapper mapBuchung(Buchung domainBuchung) {
		de.tmosebach.slowen.api.input.Buchung apiBuchung = new de.tmosebach.slowen.api.input.Buchung();
		apiBuchung.setId(domainBuchung.getId());
		apiBuchung.setDatum(domainBuchung.getDatum());
		apiBuchung.setEmpfaenger(domainBuchung.getEmpfaenger());
		apiBuchung.setVerwendung(domainBuchung.getVerwendung());
		apiBuchung.setUmsaetze(toApiUmsatz(domainBuchung.getUmsaetze()));
		
		BuchungWrapper buchungWrapper = new BuchungWrapper();
		buchungWrapper.setBuchung(apiBuchung);
		return buchungWrapper;
	}

	private static List<de.tmosebach.slowen.api.input.Umsatz> toApiUmsatz(List<Umsatz> domainUmsaetze) {
		return domainUmsaetze.stream()
				.map( domainUmsatz -> toApiUmsatz(domainUmsatz))
				.toList();
	}

	private static de.tmosebach.slowen.api.input.Umsatz toApiUmsatz(Umsatz domainUmsatz) {
		de.tmosebach.slowen.api.input.Umsatz apiUmsatz = new de.tmosebach.slowen.api.input.Umsatz();
		apiUmsatz.setKonto(domainUmsatz.getKonto());
		apiUmsatz.setBetrag(domainUmsatz.getBetrag());
		apiUmsatz.setValuta(domainUmsatz.getValuta());
		return apiUmsatz;
	}
}
