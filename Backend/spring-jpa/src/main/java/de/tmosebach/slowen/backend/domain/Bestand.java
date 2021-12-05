package de.tmosebach.slowen.backend.domain;

import java.math.BigDecimal;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToOne;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

@Entity
public class Bestand {

	@Id
	@GeneratedValue
	private Long id;
	
	@OneToOne
	private Asset asset;
	private BigDecimal wert;
	private BigDecimal menge;
	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}
	
	public Asset getAsset() {
		return asset;
	}
	
	public void setAsset(Asset asset) {
		this.asset = asset;
	}

	public BigDecimal getWert() {
		return wert;
	}

	public void setWert(BigDecimal wert) {
		this.wert = wert;
	}

	public BigDecimal getMenge() {
		return menge;
	}
	
	public void setMenge(BigDecimal menge) {
		this.menge = menge;
	}
	@Override
	public int hashCode() {
		return HashCodeBuilder.reflectionHashCode(this);
	}
	@Override
	public boolean equals(Object obj) {
		return EqualsBuilder.reflectionEquals(this, obj);
	}
}
