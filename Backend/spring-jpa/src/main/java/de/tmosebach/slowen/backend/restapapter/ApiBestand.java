package de.tmosebach.slowen.backend.restapapter;

import java.math.BigDecimal;

import de.tmosebach.slowen.backend.domain.Asset;

public class ApiBestand {

	private String id;
	private Asset asset;
	private BigDecimal wert;
	private BigDecimal menge;
	public String getId() {
		return id;
	}
	public void setId(String id) {
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
}
