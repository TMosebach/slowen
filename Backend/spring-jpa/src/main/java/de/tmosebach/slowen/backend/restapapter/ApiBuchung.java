package de.tmosebach.slowen.backend.restapapter;

import java.util.ArrayList;
import java.util.List;

public class ApiBuchung {

	private String id;
	private ApiBuchungArt art;
	private String verwendung;
	private String empfaenger;
	private List<ApiUmsatz> umsaetze = new ArrayList<>();
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public ApiBuchungArt getArt() {
		return art;
	}
	public void setArt(ApiBuchungArt art) {
		this.art = art;
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
	public List<ApiUmsatz> getUmsaetze() {
		return umsaetze;
	}
	public void setUmsaetze(List<ApiUmsatz> umsaetze) {
		this.umsaetze = umsaetze;
	}
}
