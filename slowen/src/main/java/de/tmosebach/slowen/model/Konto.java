package de.tmosebach.slowen.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.DiscriminatorColumn;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.OneToMany;
import javax.validation.constraints.Size;


@Inheritance
@DiscriminatorColumn(name="KONTO_TYPE", length = 1)
@DiscriminatorValue("K")
@Entity
public class Konto {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name="KONTO_TYPE", insertable = false, updatable = false)
	protected String type = "K";
	
	@Column(length = 15)
	@Enumerated(EnumType.STRING)
	private KontoArt art;
	
	@Column(unique = true, length = 30)
	@Size(min = 2, max = 30)
	private String name;

	private BigDecimal saldo = BigDecimal.ZERO;

	@OneToMany(mappedBy = "konto")
	private List<KontoUmsatz> umsaetze = new ArrayList<>();
	
	public Konto() { }

	public Konto(KontoArt art, String name) {
		this.art = art;
		this.name = name;
	}

	public void addKontoUmsatz(KontoUmsatz kontoUmsatz) {
		saldo = saldo.add(kontoUmsatz.getBetrag());
		getUmsaetze().add(kontoUmsatz);
		kontoUmsatz.setKonto(this);
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getType() {
		return type;
	}

	public KontoArt getArt() {
		return art;
	}

	public void setArt(KontoArt art) {
		this.art = art;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public BigDecimal getSaldo() {
		return saldo;
	}

	public void setSaldo(BigDecimal saldo) {
		this.saldo = saldo;
	}

	public List<KontoUmsatz> getUmsaetze() {
		return umsaetze;
	}

	public void setUmsaetze(List<KontoUmsatz> umsaetze) {
		this.umsaetze = umsaetze;
	}

	@Override
	public String toString() {
		return "Konto [id=" + id + ", art=" + art + ", name=" + name + ", saldo=" + saldo + "]";
	}
}
