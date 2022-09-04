package de.tmosebach.slowen.shared.values;

import static java.util.Objects.isNull;
import static java.util.Objects.nonNull;
import static de.tmosebach.slowen.shared.values.Waehrung.EUR;
import static java.math.BigDecimal.ZERO;

import java.math.BigDecimal;
import java.util.Objects;

public class Betrag {

	public final static Betrag NULL_EUR = new Betrag(ZERO, EUR);

	private BigDecimal wert;
	private Waehrung waehrung;
	
	public Betrag(BigDecimal wert) {
		this(wert, EUR);
	}

	public Betrag(BigDecimal wert, Waehrung waehrung) {
		if (isNull(wert)) {
			throw new IllegalArgumentException("Wert ist NULL");
		}
		this.wert = wert;
		this.waehrung = waehrung;
	}

	public Betrag(double d) {
		this(d, EUR);
	}

	public Betrag(double d, Waehrung waehrung) {
		this(BigDecimal.valueOf(d), waehrung);
	}

	public Betrag add(Betrag betrag) {
		checkWaehrung(betrag.getWaehrung());
		Waehrung theWaehrung = waehleWaehrung(betrag);
		return new Betrag(this.wert.add(betrag.wert), theWaehrung);
	}

	private Waehrung waehleWaehrung(Betrag betrag) {
		Waehrung theWaehrung;
		if (nonNull(waehrung)) {
			theWaehrung = waehrung;
		} else {
			theWaehrung = betrag.getWaehrung();
		}
		return theWaehrung;
	}

	private void checkWaehrung(Waehrung otherWaehrung) {
		if(nonNull(waehrung) && nonNull(otherWaehrung)
				&& waehrung.notEquals(otherWaehrung)) {
			throw new IllegalArgumentException("Die Währungen sind nicht kompatibel.");
		}
	}
	
	@Override
	public String toString() {
		return "Betrag [wert=" + wert + ", waehrung=" + waehrung + "]";
	}

	public BigDecimal getWert() {
		return wert;
	}

	public Waehrung getWaehrung() {
		return waehrung;
	}

	@Override
	public int hashCode() {
		return Objects.hash(waehrung, wert);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Betrag other = (Betrag) obj;
		return wert.compareTo(other.wert) == 0 
				&& (waehrung == other.waehrung 
					|| ( wert == ZERO && isNull(waehrung) )
					|| ( wert == ZERO && isNull(other.waehrung) ) );
	}

	public Betrag invert() {
		return new Betrag(wert.negate(), waehrung);
	}

	public Betrag subtract(Betrag betrag) {
		checkWaehrung(betrag.getWaehrung());
		Waehrung theWaehrung = waehleWaehrung(betrag);
		return new Betrag(this.wert.subtract(betrag.wert), theWaehrung);
	}

	public boolean istPositiv() {
		return wert.compareTo(ZERO) > 0;
	}

	public Betrag multiply(double d) {
		return new Betrag(wert.multiply(BigDecimal.valueOf(d)), waehrung);
	}
	
	public boolean istNegativ() {
		return wert.compareTo(ZERO) < 0;
	}
}
