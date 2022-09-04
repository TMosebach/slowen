package de.tmosebach.slowen.shared.values;

public enum Waehrung {

	EUR,
	GBP,
	USD,
	TRY;

	boolean notEquals(Waehrung waehrung) {
		return ! this.equals(waehrung);
	}
}
