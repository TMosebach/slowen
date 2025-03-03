package de.tmosebach.slowen.api.types;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Vermoegensstand {

	private BigDecimal summe;
	private LocalDate datum;
	public Vermoegensstand(BigDecimal summe, LocalDate datum) {
		this.summe = summe;
		this.datum = datum;
	}
	public BigDecimal getSumme() {
		return summe;
	}
	public void setSumme(BigDecimal summe) {
		this.summe = summe;
	}
	public LocalDate getDatum() {
		return datum;
	}
	public void setDatum(LocalDate datum) {
		this.datum = datum;
	}
}
