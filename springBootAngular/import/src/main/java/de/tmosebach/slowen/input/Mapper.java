package de.tmosebach.slowen.input;

import de.tmosebach.slowen.buchhaltung.builder.BuchungBuilder;

@FunctionalInterface
interface Mapper {
	void map(BuchungBuilder builder, String value);
}