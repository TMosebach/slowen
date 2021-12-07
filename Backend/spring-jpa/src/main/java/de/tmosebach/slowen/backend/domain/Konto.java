package de.tmosebach.slowen.backend.domain;

import java.math.BigDecimal;
import java.util.List;

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

@Entity
public class Konto {

	@Id
	@GeneratedValue
	private Long id;
	
	@Column(unique = true)
	private String name;
	private BilanzTyp bilanzTyp;
	private BigDecimal saldo = BigDecimal.ZERO;
	
	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@JoinColumn(name = "konto_id")
	private List<Umsatz> umsaetze;
	
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
	public BilanzTyp getBilanzTyp() {
		return bilanzTyp;
	}
	public void setBilanzTyp(BilanzTyp bilanzTyp) {
		this.bilanzTyp = bilanzTyp;
	}
	public BigDecimal getSaldo() {
		return saldo;
	}
	public void setSaldo(BigDecimal saldo) {
		this.saldo = saldo;
	}
	public List<Umsatz> getUmsaetze() {
		return umsaetze;
	}
	public void setUmsaetze(List<Umsatz> umsaetze) {
		this.umsaetze = umsaetze;
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
