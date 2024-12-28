package de.tmosebach.slowen.domain;

import java.math.BigDecimal;
import java.time.LocalDate;

import de.tmosebach.slowen.values.KontoArt;

public class DomainFunctions {

	public static KontoUmsatz createKontoUmsatz(String kontoName, LocalDate valuta, BigDecimal betrag) {
		KontoUmsatz umsatz = new KontoUmsatz();
		umsatz.setArt(KontoArt.Konto);
		umsatz.setKonto(kontoName);
		umsatz.setValuta(valuta);
		umsatz.setBetrag(betrag);
		return umsatz;
	}
	
	private DomainFunctions() {}
}
