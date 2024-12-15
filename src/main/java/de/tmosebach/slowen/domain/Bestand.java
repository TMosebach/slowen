package de.tmosebach.slowen.domain;

import static java.math.BigDecimal.ZERO;
import java.math.BigDecimal;

public class Bestand {

	private String asset;
	private BigDecimal menge = ZERO;
	private BigDecimal einstand = ZERO;
	
	@Override
	public String toString() {
		return "Bestand [asset=" + asset + ", menge=" + menge + ", einstand=" + einstand + "]";
	}
	public String getAsset() {
		return asset;
	}
	public void setAsset(String asset) {
		this.asset = asset;
	}
	public BigDecimal getMenge() {
		return menge;
	}
	public void setMenge(BigDecimal menge) {
		this.menge = menge;
	}
	public BigDecimal getEinstand() {
		return einstand;
	}
	public void setEinstand(BigDecimal einstand) {
		this.einstand = einstand;
	}
}
