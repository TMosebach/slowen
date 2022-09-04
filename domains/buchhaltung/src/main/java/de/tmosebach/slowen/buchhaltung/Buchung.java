package de.tmosebach.slowen.buchhaltung;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class Buchung {

	private BuchungIdentifier id;
	private BuchungArt art;
	private LocalDate datum;
	private String verwendung;
	private String empfaenger;
	private List<Umsatz> umsaetze;
	
	public Buchung(
			BuchungIdentifier id, 
			BuchungArt art,
			LocalDate datum) {
		this.id = id;
		this.art = art;
		this.datum = datum;
		this.umsaetze = new ArrayList<>();
	}

	@Override
	public String toString() {
		return "Buchung [art=" + art + ", datum=" + datum + ", verwendung=" + verwendung + ", empfaenger=" + empfaenger
				+ ", umsaetze=" + umsaetze + "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(art, datum, empfaenger, umsaetze, verwendung);
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
		return art == other.art && Objects.equals(datum, other.datum) && Objects.equals(empfaenger, other.empfaenger)
				&& Objects.equals(umsaetze, other.umsaetze) && Objects.equals(verwendung, other.verwendung);
	}
	
	public void addUmsatz(Umsatz umsatz) {
		this.umsaetze.add(umsatz);
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

	public BuchungIdentifier getId() {
		return id;
	}

	public BuchungArt getArt() {
		return art;
	}

	public LocalDate getDatum() {
		return datum;
	}

	public List<Umsatz> getUmsaetze() {
		return umsaetze;
	}
}
