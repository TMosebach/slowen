package de.tmosebach.slowen.buchhaltung.api.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import javax.validation.constraints.Size;

public class BucheRequest {
	
	/**
	 * Default: now
	 */
	private LocalDate buchungsDatum;
	
	@Size( min = 0, max = 50)
	private String verwendung;
	
	@Size( min = 0, max = 50)
	private String empfaenger;
	
	@Size(min = 2)
	private List<KontoBuchungen> kontoBuchungen = new ArrayList<>();
	
	public LocalDate getBuchungsDatum() {
		return buchungsDatum;
	}
	public void setBuchungsDatum(LocalDate buchungsDatum) {
		this.buchungsDatum = buchungsDatum;
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
	public List<KontoBuchungen> getKontoBuchungen() {
		return kontoBuchungen;
	}
	public void setKontoBuchungen(List<KontoBuchungen> kontoBuchungen) {
		this.kontoBuchungen = kontoBuchungen;
	}
	@Override
	public String toString() {
		return "BucheCommand [buchungsDatum=" + buchungsDatum + ", verwendung=" + verwendung
				+ ", empfaenger=" + empfaenger + ", kontoBuchungen=" + kontoBuchungen + "]";
	}
}
