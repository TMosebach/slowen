package de.tmosebach.slowen.api.input;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Einlieferung implements Bestandsvorgang {

	private LocalDate datum;
	private String depot;
	private String asset;
	private LocalDate valuta;
	private BigDecimal menge;
	private BigDecimal betrag;
	@Override
	public String toString() {
		return "Einlieferung [datum=" + datum + ", depot=" + depot + ", asset=" + asset + ", valuta=" + valuta
				+ ", menge=" + menge + ", betrag=" + betrag + "]";
	}
	public LocalDate getDatum() {
		return datum;
	}
	public void setDatum(LocalDate datum) {
		this.datum = datum;
	}
	public String getDepot() {
		return depot;
	}
	public void setDepot(String depot) {
		this.depot = depot;
	}
	public String getAsset() {
		return asset;
	}
	public void setAsset(String asset) {
		this.asset = asset;
	}
	public LocalDate getValuta() {
		return valuta;
	}
	public void setValuta(LocalDate valuta) {
		this.valuta = valuta;
	}
	public BigDecimal getMenge() {
		return menge;
	}
	public void setMenge(BigDecimal menge) {
		this.menge = menge;
	}
	public BigDecimal getBetrag() {
		return betrag;
	}
	public void setBetrag(BigDecimal betrag) {
		this.betrag = betrag;
	}
}
