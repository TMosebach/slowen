package de.tmosebach.slowen.buchhaltung;

public interface BuchungRepository {

	void save(Buchung buchung);

	void saveUmsatz(Umsatz umsatz);

}
