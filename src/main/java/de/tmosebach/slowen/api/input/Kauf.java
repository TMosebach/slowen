package de.tmosebach.slowen.api.input;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Kauf implements Bestandsvorgang {

	private LocalDate datum;
	private String depot;
	private String konto;
	private String asset;
	private LocalDate valuta;
	private BigDecimal menge;
	private BigDecimal betrag;
	private BigDecimal provision;
	private BigDecimal stueckzins;
	@Override
	public String toString() {
		return "Kauf [datum=" + datum + ", depot=" + depot + ", konto=" + konto + ", asset=" + asset
				+ ", valuta=" + valuta + ", menge=" + menge + ", betrag=" + betrag + ", provision=" + provision
				+ ", stueckzins=" + stueckzins + "]";
	}
	public LocalDate getDatum() {
		return datum;
	}
	public void setDatum(LocalDate datum) {
		this.datum = datum;
	}
	@Override
	public String getDepot() {
		return depot;
	}
	@Override
	public void setDepot(String depot) {
		this.depot = depot;
	}
	public String getKonto() {
		return konto;
	}
	public void setKonto(String konto) {
		this.konto = konto;
	}
	@Override
	public String getAsset() {
		return asset;
	}
	@Override
	public void setAsset(String asset) {
		this.asset = asset;
	}
	public LocalDate getValuta() {
		return valuta;
	}
	public void setValuta(LocalDate valuta) {
		this.valuta = valuta;
	}
	@Override
	public BigDecimal getMenge() {
		return menge;
	}
	@Override
	public void setMenge(BigDecimal menge) {
		this.menge = menge;
	}
	public BigDecimal getBetrag() {
		return betrag;
	}
	public void setBetrag(BigDecimal betrag) {
		this.betrag = betrag;
	}
	public BigDecimal getProvision() {
		return provision;
	}
	public void setProvision(BigDecimal provision) {
		this.provision = provision;
	}
	public BigDecimal getStueckzins() {
		return stueckzins;
	}
	public void setStueckzins(BigDecimal stueckzins) {
		this.stueckzins = stueckzins;
	}
}
