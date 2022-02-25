package de.tmosebach.slowen.backend.restapapter;

import static java.util.Objects.nonNull;
import java.util.List;
import java.util.stream.Collectors;

import de.tmosebach.slowen.backend.domain.Buchung;
import de.tmosebach.slowen.backend.domain.Umsatz;

public class Api2DomainMapper {

	public static Buchung apiBuchung2Buchung(ApiBuchung apiBuchung) {
		Buchung buchung = new Buchung();
		buchung.setArt(apiBuchung.getArt());
		buchung.setDatum(apiBuchung.getDatum());
		buchung.setEmpfaenger(apiBuchung.getEmpfaenger());
		buchung.setBeschreibung(apiBuchung.getBeschreibung());
		buchung.setUmsaetze(apiUmsatzList2umsatzList(apiBuchung.getUmsaetze()));

		return buchung;
	}

	private static List<Umsatz> apiUmsatzList2umsatzList(List<ApiUmsatz> umsaetze) {
		return umsaetze.stream().map( apiUmsatz -> apiUmsatz2Umsatz(apiUmsatz)).collect(Collectors.toList());
	}

	private static Umsatz apiUmsatz2Umsatz(ApiUmsatz apiUmsatz) {
		Umsatz umsatz = new Umsatz();
		if (nonNull(apiUmsatz.getKonto())) {
			umsatz.setKonto(apiUmsatz.getKonto());
		}
		umsatz.setValuta(apiUmsatz.getValuta());
		umsatz.setBetrag(apiUmsatz.getBetrag());
		if (nonNull(apiUmsatz.getAsset())) {
			umsatz.setAsset(apiUmsatz.getAsset());
		}
		if (nonNull(apiUmsatz.getMenge())) {
			umsatz.setMenge(apiUmsatz.getMenge());
		}
		return umsatz;
	}
}
