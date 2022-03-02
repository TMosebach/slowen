package de.tmosebach.slowen.backend.values;

import static java.math.BigDecimal.valueOf;
import static java.util.Objects.isNull;

import java.math.BigDecimal;
import java.util.Objects;

import javax.persistence.Embeddable;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Embeddable
public class Betrag {
	
	public static Betrag ZERO = new Betrag(BigDecimal.ZERO, null);

	@NotNull(message = "Betrag erfordert einen Wert")
	private BigDecimal betrag;
	
	@NotNull(message = "Betrag erforder eine Währung")
	@Size(min = 3, max = 3, message = "Eine Währung hat die Form dreier Grossbuchstaben")
	private String waehrung;
	
	/**
	 * Defaultkonstruktor für JPA
	 */
	public Betrag() {}
	public Betrag(BigDecimal betrag, String waehrung) {
		if (isNull(betrag) && isNull(waehrung)) {
			throw new IllegalArgumentException("Fehlender Pflichtparameter");
		}
		this.betrag = betrag;
		this.waehrung = waehrung;
	}
	public BigDecimal getBetrag() {
		return betrag;
	}
	public String getWaehrung() {
		return waehrung;
	}
	@Override
	public String toString() {
		return "Betrag [betrag=" + betrag + ", waehrung=" + waehrung + "]";
	}
	public Betrag add(Betrag betrag) {
		if (isNull(waehrung) || betrag.getWaehrung().equals(waehrung)) {
			return new Betrag(this.betrag.add(betrag.getBetrag()), betrag.getWaehrung());
		} else {
			throw new IllegalArgumentException(
					"Währungen stimmen nicht überein: "+waehrung+ "/"+betrag.getWaehrung());
		}
	}
	public Betrag invert() {
		return new Betrag(betrag.negate(), waehrung);
	}
	@Override
	public int hashCode() {
		return Objects.hash(betrag.doubleValue(), waehrung);
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
		return betrag.compareTo(other.betrag)==0 && Objects.equals(waehrung, other.waehrung);
	}
	public Betrag mal(double abgabeAnteil) {
		return new Betrag(
				betrag.multiply(valueOf(abgabeAnteil)),
				waehrung);
	}
	public Betrag minus(Betrag abzugebenderWert) {
		return new Betrag(
				betrag.subtract(abzugebenderWert.getBetrag()),
				waehrung);
	}
	public boolean isPositiv() {
		return BigDecimal.ZERO.compareTo(betrag) < 0;
	}
	public boolean isNegativ() {
		return BigDecimal.ZERO.compareTo(betrag) > 0;
	}
}
