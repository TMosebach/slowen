package de.tmosebach.slowen.backend.values;

public enum BuchungArt {
	/**
	 * Buchung ohne Berücksichtigung von Skontren
	 */
	Buchung,
	/**
	 * Kauf
	 * <p>
	 * Erhöhung des Bestandes in einem Bestand mit Gegenbuchung
	 */
	Kauf,
	/**
	 * Verkauf
	 * <p>
	 * Minderung des Bestandes in einem Bestand mit Gegenbuchung
	 */
	Verkauf,
	/**
	 * Ertrag mit Zuordnung zu einem Asset/Bestand
	 */
	Ertrag,
	/**
	 * Einlieferung
	 * <p>
	 * Erhöhung des Bestandes in einem Bestand ohne Gegenbuchung
	 */
	Einlieferung;
}
