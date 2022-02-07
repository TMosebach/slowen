package de.tmosebach.slowen.backend.domain;

import static java.util.Objects.nonNull;

import java.util.Objects;

import de.tmosebach.slowen.backend.values.Menge;

public class Bestand {
	
	private Asset asset;
	private Menge menge = Menge.NULL_MENGE;

	public Bestand(Asset asset) {
		this.asset = asset;
	}

	public String getAssetName() {
		if (nonNull(asset)) {
			return asset.getName();
		}
		return null;
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
}
