package de.tmosebach.slowen.buchhaltung;

import java.util.List;

public interface BuchungRepository {

	void save(Buchung buchung);

	void saveUmsatz(Umsatz umsatz);

	/**
	 * Zählen der Elemente für die gegebenen Selektion..
	 * 
	 * @param selection Selektions-Parameter
	 * @return Das zugehörige Ergebnis
	 */
	int count(BuchungSelection selection);

	List<Buchung> findBuchungPagedByKonto(BuchungSelection selection);

	/**
	 * Suche Buchungen deren Verwendungszweck bzw. Empfänger das Pattern enthalten.
	 * @param pattern
	 * @return Ergebnisliste, maximal 10 Einträge.
	 */
	List<Buchung> findBuchungByPattern(String pattern);
}
