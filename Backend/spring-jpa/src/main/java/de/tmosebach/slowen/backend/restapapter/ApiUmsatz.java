package de.tmosebach.slowen.backend.restapapter;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ApiUmsatz {
	private String id;
	private BigDecimal betrag;
	private LocalDate valuta;
	private BigDecimal menge;
	private ApiAsset asset;
	private ApiBuchung buchung;
	private ApiKonto konto;
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public BigDecimal getBetrag() {
		return betrag;
	}
	public void setBetrag(BigDecimal betrag) {
		this.betrag = betrag;
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
	public ApiAsset getAsset() {
		return asset;
	}
	public void setAsset(ApiAsset asset) {
		this.asset = asset;
	}
	public ApiBuchung getBuchung() {
		return buchung;
	}
	public void setBuchung(ApiBuchung buchung) {
		this.buchung = buchung;
	}
	public ApiKonto getKonto() {
		return konto;
	}
	public void setKonto(ApiKonto konto) {
		this.konto = konto;
	}
}
