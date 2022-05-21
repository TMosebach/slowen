package de.tmosebach.slowen.backend.values;

import de.tmosebach.slowen.backend.domain.Konto;

/**
 * Vordefinierte Konten
 */
public enum Kontorahmen {

	Handelsgebuehr("Handelsgebühr"),
	Kursgewinn("Kursgewinn"),
	Kursverlust("Kursverlust");
	
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
