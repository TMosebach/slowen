package de.tmosebach.slowen.backend.domain;

import java.util.List;
import java.util.Optional;

import javax.persistence.Entity;
import javax.persistence.Id;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

import de.tmosebach.slowen.backend.values.Betrag;

@Entity
public class Konto {

	@Id
	private String name;
	private Betrag saldo = Betrag.ZERO;
	private transient List<Bestand> bestaende;

	public Konto() {}
	public Konto(String name) {
		this.name = name;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Betrag getSaldo() {
		return saldo;
	}
	public void setSaldo(Betrag saldo) {
		this.saldo = saldo;
	}
	public List<Bestand> getBestaende() {
		return bestaende;
	}
	public void setBestaende(List<Bestand> bestaende) {
		this.bestaende = bestaende;
	}
	public void addBestand(Bestand bestand) {
		this.bestaende.add(bestand);
	}
	
	public Optional<Bestand> getBestandByAssetName(String assetName) {
		return bestaende.stream().filter( bestand -> assetName.equals(bestand.getAssetName())).findFirst();
	}
	@Override
	public int hashCode() {
		return HashCodeBuilder.reflectionHashCode(this);
	}
	@Override
	public boolean equals(Object obj) {
		return EqualsBuilder.reflectionEquals(this, obj, "umsaetze");
	}
}
