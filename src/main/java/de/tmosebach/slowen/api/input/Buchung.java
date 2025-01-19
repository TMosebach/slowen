package de.tmosebach.slowen.api.input;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class Buchung {

	private String id;
	private LocalDate datum;
	private String empfaenger;
	private String verwendung;
	private List<Umsatz> umsaetze;
	
	@Override
	public String toString() {
		return "Buchung [id=" + id + ", datum=" + datum + ", empfaenger=" + empfaenger + ", verwendung=" + verwendung
				+ ", umsaetze=" + umsaetze + "]";
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
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
}
