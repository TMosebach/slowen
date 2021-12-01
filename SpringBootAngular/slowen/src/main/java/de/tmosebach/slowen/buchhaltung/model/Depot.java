package de.tmosebach.slowen.buchhaltung.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;

@DiscriminatorValue("Depot")
@Entity
public class Depot extends Konto {

	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
	@JoinColumn(name = "depot_id")
	private List<Bestand> bestaende = new ArrayList<>();

	@Override
	public <T extends KontoUmsatz> void verbuche(T umsatz) {
		umsaetze.add(umsatz);
		umsatz.setKonto(this);
	}
	
	@Override
	public BigDecimal getSaldo() {
		return bestaende.stream()
				.map( b -> b.getKaufwert())
				.reduce( BigDecimal.ZERO,  (a, b) -> a.add(b));
	}
	
	@Override
	public void setSaldo(BigDecimal saldo) {
		// Ist hier abgeleitet, das macht keinen Sinn
	}

	public List<Bestand> getBestaende() {
		return bestaende;
	}

	public void setBestaende(List<Bestand> bestaende) {
		this.bestaende = bestaende;
	}

	public void addBestand(Bestand bestand) {
		bestaende.add(bestand);
	}
}
