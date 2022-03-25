package de.tmosebach.slowen.backend.domain;

import java.math.BigDecimal;
import java.util.Objects;

import de.tmosebach.slowen.backend.values.Betrag;
import de.tmosebach.slowen.backend.values.Menge;

public class Bestand {
	
	private Asset asset;
	private Menge menge = Menge.NULL_MENGE;
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
}
