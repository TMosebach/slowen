package de.tmosebach.slowen.model;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;

@DiscriminatorValue("D")
@Entity
public class Depot extends Konto {
	
	public Depot() {
		type = "D";
	}

	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
	@JoinColumn(name = "depot_id")
	private List<Bestand> bestaende = new ArrayList<>();
	
	@OneToOne
	private Konto verrechnungskonto;

	public List<Bestand> getBestaende() {
		return bestaende;
	}

	public void setBestaende(List<Bestand> bestaende) {
		this.bestaende = bestaende;
	}

	public void addBestand(Bestand bestand) {
		getBestaende().add(bestand);
	}

	public Konto getVerrechnungskonto() {
		return verrechnungskonto;
	}

	public void setVerrechnungsKonto(Konto verrechnungskonto) {
		this.verrechnungskonto = verrechnungskonto;
	}
}
