package de.tmosebach.slowen.domain;

import de.tmosebach.slowen.values.BilanzPosition;
import de.tmosebach.slowen.values.KontoArt;

public class Konto {

	private String name;
	private KontoArt art;
	private String waehrung;
	private BilanzPosition bilanzPosition;
	@Override
	public String toString() {
		return "Konto [name=" + name + ", art=" + art + ", waehrung=" + waehrung + ", bilanzPosition=" + bilanzPosition
				+ "]";
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public KontoArt getArt() {
		return art;
	}
	public void setArt(KontoArt art) {
		this.art = art;
	}
	public String getWaehrung() {
		return waehrung;
	}
	public void setWaehrung(String waehrung) {
		this.waehrung = waehrung;
	}
	public BilanzPosition getBilanzPosition() {
		return bilanzPosition;
	}
	public void setBilanzPosition(BilanzPosition bilanzPosition) {
		this.bilanzPosition = bilanzPosition;
	}
}
