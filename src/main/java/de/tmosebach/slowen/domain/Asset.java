package de.tmosebach.slowen.domain;

import de.tmosebach.slowen.values.AssetTyp;

public class Asset {

	private String isin;
	private String name;
	private AssetTyp typ;
	private String wpk;
	
	@Override
	public String toString() {
		return "Asset [isin=" + isin + ", name=" + name + ", typ=" + typ + ", wpk=" + wpk + "]";
	}
	public String getIsin() {
		return isin;
	}
	public void setIsin(String isin) {
		this.isin = isin;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public AssetTyp getTyp() {
		return typ;
	}
	public void setTyp(AssetTyp typ) {
		this.typ = typ;
	}
	public String getWpk() {
		return wpk;
	}
	public void setWpk(String wpk) {
		this.wpk = wpk;
	}
}
