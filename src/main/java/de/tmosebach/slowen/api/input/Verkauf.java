package de.tmosebach.slowen.api.input;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Verkauf implements AssetBewegung {

	private LocalDate datum;
	private String depot;
	private String konto;
	private String asset;
	private LocalDate valuta;
	private BigDecimal menge;
	private BigDecimal betrag;
	private BigDecimal provision;
	private BigDecimal kest;
	private BigDecimal soli;
	@Override
	public String toString() {
		return "Verkauf [datum=" + datum + ", depot=" + depot + ", konto=" + konto + ", asset=" + asset + ", valuta="
				+ valuta + ", menge=" + menge + ", betrag=" + betrag + ", provision=" + provision + ", kest=" + kest
				+ ", soli=" + soli + "]";
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
	public String getKonto() {
		return konto;
	}
	public void setKonto(String konto) {
		this.konto = konto;
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
	public BigDecimal getProvision() {
		return provision;
	}
	public void setProvision(BigDecimal provision) {
		this.provision = provision;
	}
	public BigDecimal getKest() {
		return kest;
	}
	public void setKest(BigDecimal kest) {
		this.kest = kest;
	}
	public BigDecimal getSoli() {
		return soli;
	}
	public void setSoli(BigDecimal soli) {
		this.soli = soli;
	}
}
