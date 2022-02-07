package de.tmosebach.slowen.backend;

import static java.util.Objects.nonNull;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class Utils {

	private static DateTimeFormatter DATUM_FORMATER = DateTimeFormatter.ofPattern("dd.MM.yyyy");
	
	public static LocalDate string2LocalDate(String datumString) {
		return LocalDate.parse(datumString, DATUM_FORMATER);
	}
	
	public static String localDate2string(LocalDate date) {
		if (nonNull(date)) {
			return date.format(DATUM_FORMATER);
		}
		return null;
	}
}
