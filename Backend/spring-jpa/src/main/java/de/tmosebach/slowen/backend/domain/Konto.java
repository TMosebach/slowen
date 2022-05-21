package de.tmosebach.slowen.backend.domain;

import static java.util.Objects.isNull;
import static java.util.Objects.nonNull;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;

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
	
	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
	@JoinColumn(name = "konto_id")
	private List<Bestand> bestaende;

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
		if (isNull(bestaende) || bestaende.isEmpty()) {
			return saldo;
		}
		return summeEinstandswerte();
	}
	private Betrag summeEinstandswerte() {
		Betrag summe = Betrag.ZERO;
		for (Bestand bestand : bestaende) {
			summe = summe.add(bestand.getEinstandsWert());
		}
		return summe;
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
		if (isNull(this.bestaende)) {
			this.bestaende = new ArrayList<>();
		}
		this.bestaende.add(bestand);
	}
	public boolean hasBestaende() {
		return nonNull(bestaende) && bestaende.size() > 0;
	}
	@Override
	public int hashCode() {
		return HashCodeBuilder.reflectionHashCode(this);
	}
	@Override
	public boolean equals(Object obj) {
		return EqualsBuilder.reflectionEquals(this, obj, "umsaetze");
	}
	public void remove(Bestand bestand) {
		bestaende.remove(bestand);
	}
	@Override
	public String toString() {
		return "Konto [id=" + id + ", name=" + name + ", saldo=" + saldo + "]";
	}
	public Optional<Bestand> findeBestand(Asset asset) {
		return bestaende.stream()
				.filter( bestand -> bestand.getAsset().equals(asset))
				.findFirst();
	}
}
