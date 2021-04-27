package de.tmosebach.slowen.buchhaltung.model;

import static java.util.Objects.nonNull;
import java.math.BigDecimal;
import java.time.LocalDate;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.validation.constraints.NotNull;

@Inheritance
@DiscriminatorValue("KontoUmsatz")
@Entity
public class KontoUmsatz {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotNull
	@Column(nullable = false)
	private LocalDate valuta;
	
	@NotNull
	@Column(nullable = false)
	private BigDecimal betrag;
	
	@ManyToOne
	@JoinColumn(name = "konto_id", nullable = false, updatable = false)
	private Konto konto;
	
	@ManyToOne
	@JoinColumn(name = "buchung_id", nullable = false, updatable = false)
	private Buchung buchung;
	
	public String getKontoName() {
		if (nonNull(konto) ) {
			return konto.getName();
		}
		return null;
	}
	
	public LocalDate getValuta() {
		return valuta;
	}
	public void setValuta(LocalDate valuta) {
		this.valuta = valuta;
	}
	public BigDecimal getBetrag() {
		return betrag;
	}
	public void setBetrag(BigDecimal betrag) {
		this.betrag = betrag;
	}
	public Konto getKonto() {
		return konto;
	}
	public void setKonto(Konto konto) {
		this.konto = konto;
	}
	public Buchung getBuchung() {
		return buchung;
	}
	public void setBuchung(Buchung buchung) {
		this.buchung = buchung;
	}
}
