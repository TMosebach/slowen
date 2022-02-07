package de.tmosebach.slowen.backend.domain;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

import de.tmosebach.slowen.backend.values.BuchungArt;

@Entity
public class Buchung {

	@Id
	@GeneratedValue
	private Long id;
	
	@Enumerated(EnumType.STRING)
	private BuchungArt art = BuchungArt.Buchung;
	private LocalDate datum;
	private String beschreibung;
	private String empfaenger;
	
	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
	@JoinColumn(name = "buchung_id")
	private List<Umsatz> umsaetze = new ArrayList<>();
	
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public LocalDate getDatum() {
		return datum;
	}
	public void setDatum(LocalDate datum) {
		this.datum = datum;
	}
	public BuchungArt getArt() {
		return art;
	}
	public void setArt(BuchungArt art) {
		this.art = art;
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
	public List<Umsatz> getUmsaetze() {
		return umsaetze;
	}
	public void setUmsaetze(List<Umsatz> umsaetze) {
		this.umsaetze = umsaetze;
	}
	@Override
	public int hashCode() {
		return HashCodeBuilder.reflectionHashCode(this);
	}
	@Override
	public boolean equals(Object obj) {
		return EqualsBuilder.reflectionEquals(this, obj, "umsaetze", "bestaende", "saldo");
	}
	public void addUmsatz(Umsatz umsatz) {
		umsaetze.add(umsatz);
		umsatz.setBuchung(this);
	}
}
