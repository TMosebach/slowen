package de.tmosebach.slowen.buchhaltung.model;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
public class Bestand {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "asset_id", nullable = false, updatable = false)
	private Asset asset;
	
	@Column(nullable = false)
	private BigDecimal menge = BigDecimal.ZERO;
	
	@Column(nullable = false)
	private BigDecimal kaufwert = BigDecimal.ZERO;
	
	public Asset getAsset() {
		return asset;
	}
	public void setAsset(Asset asset) {
		this.asset = asset;
	}
	public BigDecimal getMenge() {
		return menge;
	}
	public void setMenge(BigDecimal menge) {
		this.menge = menge;
	}
	public BigDecimal getKaufwert() {
		return kaufwert;
	}
	public void setKaufwert(BigDecimal kaufwert) {
		this.kaufwert = kaufwert;
	}
	public void addKaufwert(BigDecimal betrag) {
		kaufwert = kaufwert.add(betrag);
	}
	public void addMenge(BigDecimal zusaetzlicheMenge) {
		menge = menge.add(zusaetzlicheMenge);
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
}
