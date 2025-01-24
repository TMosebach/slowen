package de.tmosebach.slowen.preis;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Preis {
	private String referenz;
	private LocalDate datum;
	private BigDecimal preis;
	@Override
	public String toString() {
		return "Preis [referenz=" + referenz + ", datum=" + datum + ", preis=" + preis + "]";
	}
	public LocalDate getDatum() {
		return datum;
	}
	public void setDatum(LocalDate datum) {
		this.datum = datum;
	}
	public BigDecimal getPreis() {
		return preis;
	}
	public void setPreis(BigDecimal preis) {
		this.preis = preis;
	}
	public String getReferenz() {
		return referenz;
	}
	public void setReferenz(String referenz) {
		this.referenz = referenz;
	}
}
