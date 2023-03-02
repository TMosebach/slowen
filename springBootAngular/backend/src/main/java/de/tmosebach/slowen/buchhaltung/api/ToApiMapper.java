package de.tmosebach.slowen.buchhaltung.api;

import java.util.List;
import java.util.stream.Collectors;

import de.tmosebach.slowen.buchhaltung.Buchung;
import de.tmosebach.slowen.buchhaltung.Umsatz;
import de.tmosebach.slowen.buchhaltung.api.model.BucheResponse;
import de.tmosebach.slowen.buchhaltung.api.model.KontoUmsatz;

public class ToApiMapper {

	public static BucheResponse map(Buchung buchung) {
		BucheResponse response = new BucheResponse();
		response.setArt(buchung.getArt()); 
		response.setId(buchung.getId());
		response.setDatum(buchung.getDatum());
		response.setVerwendung(buchung.getVerwendung());
		response.setEmpfaenger(buchung.getEmpfaenger());
		response.setKontoUmsaetze(map(buchung.getUmsaetze()));
		
		return response;
	}

	public static List<KontoUmsatz> map(List<Umsatz> umsaetze) {
		return umsaetze.stream()
		.map( umsatz -> map(umsatz))
		.collect(Collectors.toList());
	}

	public static KontoUmsatz map(Umsatz umsatz) {
		KontoUmsatz kontoUmsatz = new KontoUmsatz();
		kontoUmsatz.setKonto(umsatz.getKonto());
		kontoUmsatz.setValuta(umsatz.getValuta());
		kontoUmsatz.setBetrag(umsatz.getBetrag());
		kontoUmsatz.setAsset(umsatz.getAsset());
		kontoUmsatz.setMenge(umsatz.getMenge());
		return kontoUmsatz;
	}
}
