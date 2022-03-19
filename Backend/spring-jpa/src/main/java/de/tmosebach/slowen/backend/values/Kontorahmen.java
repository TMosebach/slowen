package de.tmosebach.slowen.backend.values;

import de.tmosebach.slowen.backend.domain.Konto;

/**
 * Vordefinierte Konten
 */
public enum Kontorahmen {

	// GuV
	Kursgewinn("Kursgewinn"),
	Kursverlust("Kursverlust"),
	
	// Gebühren
	Bankprovision("Bankprovision"),
	Maklercourtage("Maklercourtage"),
	Boesenplatzentgeld("Börsenplatzentgeld"),
	Spesen("Spesen"),
	SpesenAusland("Spesen Ausland"),
	SonstigeKosten("sontige Kosten"),
	
	// Steuer
	Zinsabschlagsteuer("Zinsabschlagsteuer"),
	Kapitalertragsteuer("Kapitalertragsteuer"),
	Solidaritaetszuschlag("Solidaritätszuschlag"),
	auslQuellensteuer("ausl. Quellensteuer"),
	Abgeltungssteuer("Abgeltungssteuer");
	
	private final String name;

	private Kontorahmen(String name) {
		this.name = name;
	}

	public String getName() {
		return name;
	}

	public Konto getKontoRef() {
		Konto kontoRef = new Konto();
		kontoRef.setName(name);
		return kontoRef;
	}	
}
