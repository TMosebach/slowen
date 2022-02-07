package de.tmosebach.slowen.backend.restapapter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import de.tmosebach.slowen.backend.Utils;
import de.tmosebach.slowen.backend.domain.Buchung;
import de.tmosebach.slowen.backend.values.BuchungArt;

public class ApiBuchung {
	
	public static class ApiBuchungBuilder extends Buchung {

		private ApiBuchung buchung;
		
		public ApiBuchungBuilder() {
			buchung = new ApiBuchung();
		}
		public ApiBuchung build() {
			return buchung;
		}
		public ApiBuchungBuilder datum(String datumString) {
			buchung.setDatum(Utils.string2LocalDate(datumString));
			return this;
		}
		public ApiBuchungBuilder umsatz(ApiUmsatz umsatz) {
			buchung.addUmsatz(umsatz);
			return this;
		}
		public ApiBuchungBuilder beschreibung(String beschreibung) {
			buchung.setBeschreibung(beschreibung);
			return this;
		}
		public ApiBuchungBuilder empfaenger(String empfaenger) {
			buchung.setEmpfaenger(empfaenger);
			return this;
		}
	}

	private BuchungArt art;
	private LocalDate datum;
	private String beschreibung;
	private String empfaenger;
	private List<ApiUmsatz> umsaetze = new ArrayList<>();
	
	public BuchungArt getArt() {
		return art;
	}
	public void setArt(BuchungArt art) {
		this.art = art;
	}
	public LocalDate getDatum() {
		return datum;
	}
	public void addUmsatz(ApiUmsatz umsatz) {
		umsaetze.add(umsatz);
	}
	public void setDatum(LocalDate datum) {
		this.datum = datum;
	}
	public String getBeschreibung() {
		return beschreibung;
	}
	public void setBeschreibung(String beschreibung) {
		this.beschreibung = beschreibung;
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
	@Override
	public String toString() {
		return "ApiBuchung [datum=" + datum + ", beschreibung=" + beschreibung + ", empfaenger=" + empfaenger
				+ ", umsaetze=" + umsaetze + "]";
	}
	@Override
	public int hashCode() {
		return Objects.hash(beschreibung, datum, empfaenger, umsaetze);
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ApiBuchung other = (ApiBuchung) obj;
		return Objects.equals(beschreibung, other.beschreibung) && Objects.equals(datum, other.datum)
				&& Objects.equals(empfaenger, other.empfaenger) && Objects.equals(umsaetze, other.umsaetze);
	}
}
