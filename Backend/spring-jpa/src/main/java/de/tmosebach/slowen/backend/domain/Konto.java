package de.tmosebach.slowen.backend.domain;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

import de.tmosebach.slowen.backend.values.Betrag;

@Entity
public class Konto {

	@Id
	@GeneratedValue
	private Long id;
	@Column(unique = true)
	private String name;
	private Betrag saldo = Betrag.ZERO;
	private transient List<Bestand> bestaende = new ArrayList<>();

	public Konto() {}
	public Konto(String name) {
		this.name = name;
	}
	public Konto(long id, String name) {
		this(name);
		this.id = id;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
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
	public boolean hasBestaende() {
		return bestaende.size() > 0;
	}
	
	@Override
	public int hashCode() {
		return HashCodeBuilder.reflectionHashCode(this);
	}
	@Override
	public boolean equals(Object obj) {
		return EqualsBuilder.reflectionEquals(this, obj, "umsaetze");
	}
	public Bestand getOrCreateBestand(Asset asset) {
		Optional<Bestand> bestandTreffer = bestaende.stream()
			.filter( bestand -> bestand.getAsset().getName().equals(asset.getName()))
			.findFirst();
		if (bestandTreffer.isPresent()) {
			return bestandTreffer.get();
		}
		Bestand bestand = new Bestand(asset);
		addBestand(bestand);
		return bestand;
	}
	public void remove(Bestand bestand) {
		bestaende.remove(bestand);
	}
	@Override
	public String toString() {
		return "Konto [id=" + id + ", name=" + name + ", saldo=" + saldo + "]";
	}
}
