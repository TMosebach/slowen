package de.tmosebach.slowen.api.input;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Umsatz {

	private String konto;
	private LocalDate valuta;
	private BigDecimal betrag;
	@Override
	public String toString() {
		return "Umsatz [konto=" + konto + ", valuta=" + valuta + ", betrag=" + betrag + "]";
	}
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
}
