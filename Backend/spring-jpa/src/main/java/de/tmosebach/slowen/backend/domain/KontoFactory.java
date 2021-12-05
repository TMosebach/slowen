package de.tmosebach.slowen.backend.domain;

public class KontoFactory {
	
	public static String KURS_VERLUST = "Kursverlust";
	public static String KURS_GEWINN = "Kursgewinn";
	public static String HABEN_ZINS = "Habenzins";
	public static String SOLL_ZINS = "Sollzins";
	public static String DIVIDENDE = "Dividende";
	public static String KAPITALERTRAGSTEUER = "Kapitalertragsteuer";
	public static String SOLIDARITAETSZUSCHLAG = "Solidaritätszuschlag";
	public static String PROVISION = "Provision";
	public static String BANKGEBUEHREN = "Bankgebühren";
	public static String SONSTIGE_EINNAHMEN = "Sonstige Einnahmen";
	public static String SONSTIGE_AUSGABEN = "Sonstige Ausnahmen";

	public static Konto kursVerlust() {
		Konto konto = new Konto();
		konto.setName(KURS_VERLUST);
		konto.setKategorie(Kategorie.Aufwand);
		return konto;
	}
	
	public static Konto kursGewinn() {
		Konto konto = new Konto();
		konto.setName(KURS_GEWINN);
		konto.setKategorie(Kategorie.Aufwand);
		return konto;
	}
}
