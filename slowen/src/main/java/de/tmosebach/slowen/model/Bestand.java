package de.tmosebach.slowen.model;

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
	private BigDecimal menge;
	
	@Column(nullable = false)
	private BigDecimal kaufPreis;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public BigDecimal getMenge() {
		return menge;
	}

	public void setMenge(BigDecimal menge) {
		this.menge = menge;
	}

	public BigDecimal getKaufPreis() {
		return kaufPreis;
	}

	public void setKaufPreis(BigDecimal kaufPreis) {
		this.kaufPreis = kaufPreis;
	}

	public Asset getAsset() {
		return asset;
	}

	public void setAsset(Asset asset) {
		this.asset = asset;
	}
}
