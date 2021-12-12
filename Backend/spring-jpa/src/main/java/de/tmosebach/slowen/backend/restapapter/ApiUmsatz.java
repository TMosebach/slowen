package de.tmosebach.slowen.backend.restapapter;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.*;
import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(NON_NULL)
public class ApiUmsatz {
	private String id;
	private BigDecimal betrag;
	private LocalDate valuta;
	private BigDecimal menge;
	private ApiAsset asset;
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
	public ApiKonto getKonto() {
		return konto;
	}
	public void setKonto(ApiKonto konto) {
		this.konto = konto;
	}
}
