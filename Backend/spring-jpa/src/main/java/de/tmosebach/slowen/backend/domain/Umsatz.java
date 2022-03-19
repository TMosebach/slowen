package de.tmosebach.slowen.backend.domain;

import java.time.LocalDate;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

import de.tmosebach.slowen.backend.values.Betrag;
import de.tmosebach.slowen.backend.values.Menge;

@Entity
public class Umsatz {

	@Id
	@GeneratedValue
	private Long id;
	private Betrag betrag;
	private LocalDate valuta;
	private Menge menge;

	private String asset;
	
	@ManyToOne
	private Buchung buchung;

	@ManyToOne
	private Konto konto;
	
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public Betrag getBetrag() {
		return betrag;
	}
	public void setBetrag(Betrag betrag) {
		this.betrag = betrag;
	}
	public LocalDate getValuta() {
		return valuta;
	}
	public void setValuta(LocalDate valuta) {
		this.valuta = valuta;
	}
	public Menge getMenge() {
		return menge;
	}
	public void setMenge(Menge menge) {
		this.menge = menge;
	}
	public String getAsset() {
		return asset;
	}
	public void setAsset(String asset) {
		this.asset = asset;
	}
	public Buchung getBuchung() {
		return buchung;
	}
	public void setBuchung(Buchung buchung) {
		this.buchung = buchung;
	}
	public Konto getKonto() {
		return konto;
	}
	public void setKonto(Konto konto) {
		this.konto = konto;
	}
	@Override
	public int hashCode() {
		return HashCodeBuilder.reflectionHashCode(this);
	}
	@Override
	public boolean equals(Object obj) {
		return EqualsBuilder.reflectionEquals(this, obj);
	}
}
