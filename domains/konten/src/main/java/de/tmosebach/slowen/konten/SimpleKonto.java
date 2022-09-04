package de.tmosebach.slowen.konten;

import java.math.BigDecimal;

import de.tmosebach.slowen.shared.values.Betrag;
import de.tmosebach.slowen.shared.values.KontoIdentifier;
import de.tmosebach.slowen.shared.values.Waehrung;

public class SimpleKonto extends AbstractKonto {

	public SimpleKonto(KontoIdentifier id, String name, BilanzType bilanzType) {
		super(id, name, bilanzType);
	}

	public SimpleKonto(String id, String name, BilanzType bilanzType, BigDecimal saldo, Waehrung waehrung) {
		super(id, name, bilanzType, saldo, waehrung);
	}

	@Override
	public String toString() {
		return "SimpleKonto [getType()=" + getType() + ", getId()=" + getId() + ", getName()=" + getName()
				+ ", getSaldo()=" + getSaldo() + ", getBilanzType()=" + getBilanzType() + "]";
	}

	@Override
	public KontoType getType() {
		return KontoType.Konto;
	}
	
	public void addToSaldo(Betrag betrag) {
		this.saldo = this.saldo.add(betrag);
	}
	
	
}
