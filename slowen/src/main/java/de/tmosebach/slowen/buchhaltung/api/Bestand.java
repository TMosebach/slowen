package de.tmosebach.slowen.buchhaltung.api;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class Bestand {

	private String id;
	private Asset asset;
	private BigDecimal menge;
	private BigDecimal kaufwert;
	
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
}
