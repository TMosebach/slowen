package de.tmosebach.slowen.converter.mapper;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import de.tmosebach.slowen.api.input.Buchung;
import de.tmosebach.slowen.api.input.BuchungWrapper;
import de.tmosebach.slowen.api.input.Umsatz;
import de.tmosebach.slowen.values.Vorgang;

public class IngMapper {
	
	private static final String BETRAG_FORMAT_PATTERN = "#,##0.00";
	
	private static DecimalFormat betragFormat;

	static final int COL_BUCHUNGSDATUM = 0;
	static final int COL_VALUTA = 1;
	static final int COL_EMPFAENGER = 2;
	static final int COL_BUCHUNGSTEXT = 3;
	static final int COL_VERWENDUNG = 4;
	static final int COL_BETRAG = 7;

	public static BuchungWrapper map(String zielKonto, String... fields) {
		
		betragFormat = new DecimalFormat(BETRAG_FORMAT_PATTERN);
		betragFormat.setParseBigDecimal(true);
		
		Umsatz umsatz = new Umsatz();
		umsatz.setKonto(zielKonto);
		umsatz.setValuta(mapDate(fields[COL_VALUTA]));
		umsatz.setBetrag(mapBetrag(fields[COL_BETRAG]));
		
		Umsatz gegenUmsatz = new Umsatz();
		gegenUmsatz.setKonto("???");
		gegenUmsatz.setValuta(umsatz.getValuta());
		gegenUmsatz.setBetrag(umsatz.getBetrag().negate());
		
		Buchung buchung = new Buchung();
		buchung.setDatum(mapDate(fields[COL_BUCHUNGSDATUM]));
		buchung.setEmpfaenger(fields[COL_EMPFAENGER]);
		buchung.setVerwendung(fields[COL_VERWENDUNG]);
		buchung.setUmsaetze( List.of(umsatz, gegenUmsatz) );

		BuchungWrapper wrapper = new BuchungWrapper();
		wrapper.setVorgang(Vorgang.Buchung);
		wrapper.setBuchung(buchung);
		
		return wrapper;
	}
	
	private static LocalDate mapDate(String dateString) {
		return LocalDate.parse(dateString, DateTimeFormatter.ofPattern("dd.MM.uuuu"));
	}
	
	private static BigDecimal mapBetrag(String betragString) {
		try {
			return (BigDecimal)betragFormat.parse(betragString);
		} catch (ParseException e) {
			throw new IllegalArgumentException(e);
		}
	}
}
