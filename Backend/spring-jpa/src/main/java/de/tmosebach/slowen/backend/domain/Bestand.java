package de.tmosebach.slowen.backend.domain;

import java.math.BigDecimal;
import java.util.Objects;

import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

import de.tmosebach.slowen.backend.values.Betrag;
import de.tmosebach.slowen.backend.values.Menge;

@Entity
public class Bestand {
	
	@Id
	@GeneratedValue
	private Long id;
	
	@ManyToOne
	private Konto konto;
	
	@ManyToOne
	private Asset asset;
	
	@Embedded
	private Menge menge = Menge.NULL_MENGE;
	
	@Embedded
	private Betrag einstandsWert = Betrag.ZERO;

	public Betrag getEinstandsWert() {
		return einstandsWert;
	}

	public void setEinstandsWert(Betrag einstandsWert) {
		this.einstandsWert = einstandsWert;
	}
	
	public void addEinstandswert(Betrag wert) {
		einstandsWert = einstandsWert.add(wert);
	}
	
	public Bestand() {}

	public Bestand(Asset asset) {
		this.asset = asset;
	}

	public Asset getAsset() {
		return asset;
	}

	public void setAsset(Asset asset) {
		this.asset = asset;
	}

	public Menge getMenge() {
		return menge;
	}

	public void setMenge(Menge menge) {
		this.menge = menge;
	}

	@Override
	public int hashCode() {
		return Objects.hash(asset);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Bestand other = (Bestand) obj;
		return Objects.equals(asset, other.asset);
	}

	@Override
	public String toString() {
		return "Bestand [asset=" + asset + ", menge=" + menge + "]";
	}

	public void addMenge(Menge menge) {
		this.menge = this.menge.add(menge);
	}

	public boolean isEmpty() {
		return menge.getMenge().compareTo(BigDecimal.ZERO) == 0;
	}

	public Konto getKonto() {
		return konto;
	}

	public void setKonto(Konto konto) {
		this.konto = konto;
	}
}
