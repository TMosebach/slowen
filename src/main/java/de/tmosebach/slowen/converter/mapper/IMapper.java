package de.tmosebach.slowen.converter.mapper;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import de.tmosebach.slowen.api.input.BuchungWrapper;
import de.tmosebach.slowen.converter.EingabeTyp;
public interface IMapper {
	
	static final String BETRAG_FORMAT_PATTERN = "#,##0.00";
	static final DecimalFormat betragFormat= new DecimalFormat(BETRAG_FORMAT_PATTERN);

	BuchungWrapper map(String zielKonto, String... fields);
	EingabeTyp getTyp();
	int getAnzahlKopfzeilen();
	
	default BigDecimal mapBetrag(String betragString) {
		try {
			betragFormat.setParseBigDecimal(true);
			return (BigDecimal)betragFormat.parse(betragString);
		} catch (ParseException e) {
			throw new IllegalArgumentException(e);
		}
	}
	
	default LocalDate mapDate(String dateString) {
		return LocalDate.parse(dateString, DateTimeFormatter.ofPattern("dd.MM.uuuu"));
	}
}