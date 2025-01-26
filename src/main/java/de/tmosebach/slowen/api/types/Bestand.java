package de.tmosebach.slowen.api.types;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Bestand {

	private String depot;
	private String asset;
	private BigDecimal menge;
	private BigDecimal einstand;
	private LocalDate datum;
	private BigDecimal wert;
	
	@Override
	public String toString() {
		return "Bestand [depot=" + depot + ", asset=" + asset + ", menge=" + menge + ", einstand=" + einstand
				+ ", datum=" + datum + ", wert=" + wert + "]";
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
	public LocalDate getDatum() {
		return datum;
	}
	public void setDatum(LocalDate datum) {
		this.datum = datum;
	}
	public BigDecimal getWert() {
		return wert;
	}
	public void setWert(BigDecimal wert) {
		this.wert = wert;
	}
	public String getDepot() {
		return depot;
	}
	public void setDepot(String depot) {
		this.depot = depot;
	}
}
