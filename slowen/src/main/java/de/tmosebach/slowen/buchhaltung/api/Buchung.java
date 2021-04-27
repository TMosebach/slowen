package de.tmosebach.slowen.buchhaltung.api;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class Buchung {

	private String id;
	private String verwendung;
	private String empfaenger;
	private List<Umsatz> umsaetze = new ArrayList<>();
	
	public void addUmsatz(Umsatz umsatz) {
		umsaetze.add(umsatz);
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getVerwendung() {
		return verwendung;
	}

	public void setVerwendung(String verwendung) {
		this.verwendung = verwendung;
	}

	public String getEmpfaenger() {
		return empfaenger;
	}

	public void setEmpfaenger(String empfaenger) {
		this.empfaenger = empfaenger;
	}

	public List<Umsatz> getUmsaetze() {
		return umsaetze;
	}

	public void setUmsaetze(List<Umsatz> umsaetze) {
		this.umsaetze = umsaetze;
	}
}
