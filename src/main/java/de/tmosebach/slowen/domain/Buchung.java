package de.tmosebach.slowen.domain;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import de.tmosebach.slowen.values.Vorgang;

public class Buchung {

	private String id;
	private Vorgang vorgang;
	private LocalDate datum;
	private String empfaenger;
	private String verwendung;
	private List<KontoUmsatz> umsaetze = new ArrayList<>();
	
	@Override
	public String toString() {
		return "Buchung [id=" + id + ", vorgang=" + vorgang + ", datum=" + datum + ", empfaenger=" + empfaenger
				+ ", verwendung=" + verwendung + ", umsaetze=" + umsaetze + "]";
	}
	public LocalDate getDatum() {
		return datum;
	}
	public String getEmpfaenger() {
		return empfaenger;
	}
	public String getVerwendung() {
		return verwendung;
	}
	public void addUmsatz(KontoUmsatz kontoUmsatz) {
		kontoUmsatz.setBuchung(this);
		umsaetze.add(kontoUmsatz);
	}
	public List<KontoUmsatz> getUmsaetze() {
		return umsaetze;
	}
	@Override
	public int hashCode() {
		return Objects.hash(datum, empfaenger, id, umsaetze, verwendung);
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Buchung other = (Buchung) obj;
		return Objects.equals(datum, other.datum) && Objects.equals(empfaenger, other.empfaenger)
				&& Objects.equals(id, other.id) && Objects.equals(umsaetze, other.umsaetze)
				&& Objects.equals(verwendung, other.verwendung);
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public void setDatum(LocalDate datum) {
		this.datum = datum;
	}
	public void setEmpfaenger(String empfaenger) {
		this.empfaenger = empfaenger;
	}
	public void setVerwendung(String verwendung) {
		this.verwendung = verwendung;
	}
	public void setUmsaetze(List<KontoUmsatz> umsaetze) {
		this.umsaetze = umsaetze;
	}
	public Vorgang getVorgang() {
		return vorgang;
	}
	public void setVorgang(Vorgang vorgang) {
		this.vorgang = vorgang;
	}
}
