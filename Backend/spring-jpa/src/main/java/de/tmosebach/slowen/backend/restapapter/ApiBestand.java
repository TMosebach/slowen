package de.tmosebach.slowen.backend.restapapter;

import java.util.Objects;

import de.tmosebach.slowen.backend.values.Betrag;
import de.tmosebach.slowen.backend.values.Menge;

public class ApiBestand {

	private String asset;
	private Betrag einstandsWert;
	private Menge menge;
	public String getAsset() {
		return asset;
	}
	public void setAsset(String asset) {
		this.asset = asset;
	}
	public Betrag getEinstandsWert() {
		return einstandsWert;
	}
	public void setEinstandsWert(Betrag einstandsWert) {
		this.einstandsWert = einstandsWert;
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
		ApiBestand other = (ApiBestand) obj;
		return Objects.equals(asset, other.asset);
	}
	@Override
	public String toString() {
		return "ApiBestand [asset=" + asset + ", einstandsWert=" + einstandsWert + ", menge=" + menge + "]";
	}
}
