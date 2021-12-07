package de.tmosebach.slowen.backend.domain;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

@Entity

public class Depot extends Konto {

	private String nummer;
	
	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
	@JoinColumn(name = "depot_id")
	private List<Bestand> bestaende = new ArrayList<>();

	public List<Bestand> getBestaende() {
		return bestaende;
	}

	public void setBestaende(List<Bestand> bestaende) {
		this.bestaende = bestaende;
	}
	@Override
	public int hashCode() {
		return HashCodeBuilder.reflectionHashCode(this);
	}
	@Override
	public boolean equals(Object obj) {
		return EqualsBuilder.reflectionEquals(this, obj, "umsaetze", "bestaende", "saldo");
	}

	public void addBestand(Bestand bestand) {
		bestaende.add(bestand);
	}
	
	@Override
	public BigDecimal getSaldo() {
		BigDecimal saldo = BigDecimal.ZERO;
		for (Bestand bestand : bestaende) {
			saldo = saldo.add(bestand.getWert());
		}
		return saldo;
	}
	
	/**
	 * Nichts übernehmen, ergibt sich hier aus den Beständen
	 */
	@Override
	public void setSaldo(BigDecimal saldo) {}

	public String getNummer() {
		return nummer;
	}

	public void setNummer(String nummer) {
		this.nummer = nummer;
	}
}
