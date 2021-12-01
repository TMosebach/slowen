package de.tmosebach.slowen.buchhaltung.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import javax.validation.constraints.Size;

@Inheritance
@DiscriminatorValue("Konto")
@Entity
@Table(uniqueConstraints = {
		@UniqueConstraint(name = "eindeutigerKontoname", columnNames = "name")
})
public class Konto {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(length = 15)
	@Enumerated(EnumType.STRING)
	private KontoArt art;
	
	@Column(name="name", length = 30)
	@Size(min = 2, max = 30)
	private String name;
	
	private BigDecimal saldo = BigDecimal.ZERO;
	
	@OneToMany(mappedBy = "konto")
	protected List<KontoUmsatz> umsaetze = new ArrayList<>();

	public void addKontoUmsatz(KontoUmsatz u) {
		umsaetze.add(u);
		if (u.getBetrag() != null) { // Bei Einnahme
			saldo = saldo.add(u.getBetrag());
		}
		u.setKonto(this);
	}
	
	public <T extends KontoUmsatz> void verbuche(T umsatz) {
		umsaetze.add(umsatz);
		saldo = saldo.add(umsatz.getBetrag());
		umsatz.setKonto(this);
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

	public KontoArt getArt() {
		return art;
	}

	public void setArt(KontoArt art) {
		this.art = art;
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
}
