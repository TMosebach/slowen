package de.tmosebach.slowen.konten;

import static de.tmosebach.slowen.shared.values.Betrag.NULL_EUR;

import java.math.BigDecimal;
import java.util.Objects;

import de.tmosebach.slowen.shared.values.Betrag;
import de.tmosebach.slowen.shared.values.KontoIdentifier;
import de.tmosebach.slowen.shared.values.Waehrung;

public abstract class AbstractKonto implements Konto {

	private KontoIdentifier id;
	private String name;
	private BilanzType bilanzType;
	protected Betrag saldo;
	
	public AbstractKonto(KontoIdentifier id, String name, BilanzType bilanzType) {
		this.id = id;
		this.name = name;
		this.bilanzType = bilanzType;
		this.saldo = NULL_EUR;
	}
	
	public AbstractKonto(String id, String name, BilanzType bilanzType, BigDecimal saldo, Waehrung waehrung) {
		this.id = new KontoIdentifier(id);
		this.name = name;
		this.bilanzType = bilanzType;
		this.saldo = new Betrag(saldo, waehrung);
	}
	
	public abstract KontoType getType();
	
	@Override
	public int hashCode() {
		return Objects.hash(id);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		AbstractKonto other = (AbstractKonto) obj;
		return Objects.equals(id, other.id);
	}

	@Override
	public KontoIdentifier getId() {
		return id;
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public Betrag getSaldo() {
		return saldo;
	}

	@Override
	public BilanzType getBilanzType() {
		return bilanzType;
	}
}
