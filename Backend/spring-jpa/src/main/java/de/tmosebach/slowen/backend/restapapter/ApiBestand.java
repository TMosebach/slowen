package de.tmosebach.slowen.backend.restapapter;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(NON_NULL)
public class ApiBestand {

	private String id;
	private ApiAsset asset;
	private BigDecimal wert;
	private BigDecimal menge;
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public ApiAsset getAsset() {
		return asset;
	}
	public void setAsset(ApiAsset asset) {
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
