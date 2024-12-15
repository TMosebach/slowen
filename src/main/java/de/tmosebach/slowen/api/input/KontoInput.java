package de.tmosebach.slowen.api.input;

import java.math.BigDecimal;
import java.time.LocalDate;

import de.tmosebach.slowen.values.BilanzPosition;
import de.tmosebach.slowen.values.KontoArt;

public class KontoInput {

	private String name;
	private KontoArt art;
	private String waehrung;
	private BilanzPosition bilanzPosition;
	private BigDecimal saldo;
	private LocalDate datum;
	@Override
	public String toString() {
		return "KontoInput [name=" + name + ", art=" + art + ", waehrung=" + waehrung + ", bilanzPosition="
				+ bilanzPosition + ", saldo=" + saldo + ", datum=" + datum + "]";
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
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
	public BigDecimal getSaldo() {
		return saldo;
	}
	public void setSaldo(BigDecimal saldo) {
		this.saldo = saldo;
	}
	public LocalDate getDatum() {
		return datum;
	}
	public void setDatum(LocalDate datum) {
		this.datum = datum;
	}
	public KontoArt getArt() {
		return art;
	}
	public void setArt(KontoArt art) {
		this.art = art;
	}
}
