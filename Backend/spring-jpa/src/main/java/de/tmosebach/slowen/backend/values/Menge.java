package de.tmosebach.slowen.backend.values;

import java.math.BigDecimal;
import java.util.Objects;

import javax.persistence.Embeddable;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Embeddable
public class Menge {

	public static final Menge NULL_MENGE = new Menge(0.0);
	public static final String EINHEIT_STUECK = "St.";
	
	@NotNull(message = "Eine Menge benötigt einen Wert")
	private BigDecimal menge;
	
	@NotBlank(message = "Eine benötigt eine Einheit")
	private String einheit;
	
	/**
	 * Defaultkonstruktor für JPA
	 */
	public Menge() {}
	
	/**
	 * Anlegen einer Menge mit Default-Einheit "St."
	 * 
	 * @param menge Wert der Menge.
	 */
	public Menge(BigDecimal menge) {
		this(menge, EINHEIT_STUECK);
	}
	
	public Menge(BigDecimal menge, String einheit) {
		this.menge = menge;
		this.einheit = einheit;
	}

	public Menge(double menge, String einheit) {
		this.menge = BigDecimal.valueOf(menge);
		this.einheit = einheit;
	}

	public Menge(double menge) {
		this(menge, EINHEIT_STUECK);
	}

	public BigDecimal getMenge() {
		return menge;
	}

	public void setMenge(BigDecimal menge) {
		this.menge = menge;
	}

	public String getEinheit() {
		return einheit;
	}

	public void setEinheit(String einheit) {
		this.einheit = einheit;
	}

	@Override
	public String toString() {
		return "Menge [menge=" + menge + ", einheit=" + einheit + "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(einheit, menge);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Menge other = (Menge) obj;
		return Objects.equals(einheit, other.einheit) && menge.compareTo(other.menge)==0;
	}

	public Menge invert() {
		return new Menge(menge.negate(), einheit);
	}

	public Menge add(Menge menge) {
		if (! this.einheit.equals(menge.getEinheit())
				&& this != NULL_MENGE) {
			throw new IllegalArgumentException(
				"Einheiten stimmen nicht überein: "+menge.getEinheit()+ " statt "+this.einheit);
		}
		return new Menge(this.menge.add(menge.getMenge()), einheit);
	}
}
