package de.tmosebach.slowen.api.input;

import java.time.LocalDate;
import java.util.List;

public class Buchung {

	private LocalDate datum;
	private String empfaenger;
	private String verwendung;
	private List<Umsatz> umsaetze;
	
	@Override
	public String toString() {
		return "Buchung [datum=" + datum + ", empfaenger=" + empfaenger + ", verwendung=" + verwendung + ", umsaetze="
				+ umsaetze + "]";
	}
	public LocalDate getDatum() {
		return datum;
	}
	public void setDatum(LocalDate datum) {
		this.datum = datum;
	}
	public String getEmpfaenger() {
		return empfaenger;
	}
	public void setEmpfaenger(String empfaenger) {
		this.empfaenger = empfaenger;
	}
	public String getVerwendung() {
		return verwendung;
	}
	public void setVerwendung(String verwendung) {
		this.verwendung = verwendung;
	}
	public List<Umsatz> getUmsaetze() {
		return umsaetze;
	}
	public void setUmsaetze(List<Umsatz> umsaetze) {
		this.umsaetze = umsaetze;
	}
}
