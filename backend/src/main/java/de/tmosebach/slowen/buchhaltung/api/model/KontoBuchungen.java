package de.tmosebach.slowen.buchhaltung.api.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public class KontoBuchungen {

	@Size( min=36, max=36)
	@NotNull
	private String konto;
	
	private LocalDate valuta;
	
	@NotNull
	private BigDecimal betrag;
	
	@NotNull
	@Size( min=3, max=3)
	private String waehrung;

	public String getKonto() {
		return konto;
	}

	public void setKonto(String konto) {
		this.konto = konto;
	}

	public LocalDate getValuta() {
		return valuta;
	}

	public void setValuta(LocalDate valuta) {
		this.valuta = valuta;
	}

	public BigDecimal getBetrag() {
		return betrag;
	}

	public void setBetrag(BigDecimal betrag) {
		this.betrag = betrag;
	}

	public String getWaehrung() {
		return waehrung;
	}

	public void setWaehrung(String waehrung) {
		this.waehrung = waehrung;
	}

	@Override
	public String toString() {
		return "KontoBuchungen [konto=" + konto + ", valuta=" + valuta + ", betrag=" + betrag + ", waehrung=" + waehrung
				+ "]";
	}	
}
