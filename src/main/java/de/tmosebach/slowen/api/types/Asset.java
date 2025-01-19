package de.tmosebach.slowen.api.types;

import de.tmosebach.slowen.values.AssetTyp;

public class Asset {

	private String isin;
	private String wpk;
	private String name;
	private AssetTyp typ;
	@Override
	public String toString() {
		return "AssetInput [isin=" + isin + ", wpk=" + wpk + ", name=" + name + ", typ=" + typ + "]";
	}
	public String getIsin() {
		return isin;
	}
	public void setIsin(String isin) {
		this.isin = isin;
	}
	public String getWpk() {
		return wpk;
	}
	public void setWpk(String wpk) {
		this.wpk = wpk;
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
}
