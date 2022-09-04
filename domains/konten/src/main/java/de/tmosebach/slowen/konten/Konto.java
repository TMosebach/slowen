package de.tmosebach.slowen.konten;

import de.tmosebach.slowen.shared.values.Betrag;
import de.tmosebach.slowen.shared.values.KontoIdentifier;

public interface Konto {

	KontoIdentifier getId();

	String getName();

	Betrag getSaldo();

	BilanzType getBilanzType();
	
	KontoType getType();
}