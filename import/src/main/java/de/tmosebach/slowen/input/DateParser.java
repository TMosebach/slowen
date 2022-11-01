package de.tmosebach.slowen.input;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class DateParser {

	private static DateTimeFormatter datePattern = DateTimeFormatter.ofPattern("d.M.u");
	
	public static LocalDate parseDate(String dateString) {
		return LocalDate.parse(dateString, datePattern);
	}
}
