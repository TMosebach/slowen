package de.tmosebach.slowen.buchhaltung.model;

import java.math.BigDecimal;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@DiscriminatorValue("DepotUmsatz")
@Entity
public class DepotUmsatz extends KontoUmsatz {

	@ManyToOne
	@JoinColumn(name = "asset_id", nullable = true, updatable = false)
	private Asset asset;
	
	private BigDecimal menge;
	
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
//	public Bestand getBestand() {
//		return bestand;
//	}
//	public void setBestand(Bestand bestand) {
//		this.bestand = bestand;
//	}
}
