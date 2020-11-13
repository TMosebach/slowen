package de.tmosebach.slowen.model;

import static java.util.Objects.nonNull;

import java.math.BigDecimal;
import java.time.LocalDate;

import javax.persistence.Column;
import javax.persistence.DiscriminatorColumn;
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
@DiscriminatorColumn(name="UMSATZ_TYPE")
@DiscriminatorValue("K")
@Entity
public class KontoUmsatz {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name="UMSATZ_TYPE", insertable = false, updatable = false)
	protected String type = "K";

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
	
	/**
	 * Gibt den Namen des zugehörigen Kontos zurück.
	 * 
	 * @return Name des Kontos oder {@code null}, falls es kein Konto gibt.
	 */
	public String getKontoName() {
		if (nonNull(konto)) {
			return konto.getName();
		}
		return null;
	}
	
	public boolean isDepotUmsatz() {
		return false;
	}
	
	public Long getId() {
		return id;
	}

	
	public void setId(Long id) {
		this.id = id;
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
	
	
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	@Override
	public String toString() {
		return "KontoUmsatz [id=" + id + ", valuta=" + valuta + ", betrag=" + betrag + "]";
	}
}
