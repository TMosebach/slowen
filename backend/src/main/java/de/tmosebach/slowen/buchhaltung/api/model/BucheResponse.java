package de.tmosebach.slowen.buchhaltung.api.model;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import de.tmosebach.slowen.buchhaltung.BuchungArt;
import de.tmosebach.slowen.buchhaltung.BuchungIdentifier;

@JsonInclude(Include.NON_NULL)
public class BucheResponse {

	private BuchungIdentifier id;
	private BuchungArt art;
	private LocalDate datum;
	private String verwendung;
	private String empfaenger;
	private List<KontoUmsatz> kontoUmsaetze;
	@Override
	public String toString() {
		return "BucheResponse [id=" + id + ", art=" + art + ", datum=" + datum + ", verwendung=" + verwendung
				+ ", empfaenger=" + empfaenger + ", kontoUmsaetze=" + kontoUmsaetze + "]";
	}
	public BuchungIdentifier getId() {
		return id;
	}
	public void setId(BuchungIdentifier id) {
		this.id = id;
	}
	public BuchungArt getArt() {
		return art;
	}
	public void setArt(BuchungArt art) {
		this.art = art;
	}
	public LocalDate getDatum() {
		return datum;
	}
	public void setDatum(LocalDate datum) {
		this.datum = datum;
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
	public List<KontoUmsatz> getKontoUmsaetze() {
		return kontoUmsaetze;
	}
	public void setKontoUmsaetze(List<KontoUmsatz> kontoUmsaetze) {
		this.kontoUmsaetze = kontoUmsaetze;
	}

}
