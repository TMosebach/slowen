package de.tmosebach.slowen.api.types;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import de.tmosebach.slowen.values.BilanzPosition;
import de.tmosebach.slowen.values.KontoArt;

@JsonInclude(Include.NON_NULL)
public class Konto {

	private String name;
	private KontoArt art;
	private String waehrung;
	private BilanzPosition bilanzPosition;
	private BigDecimal saldo;
	private LocalDate datum;
	private List<Bestand> bestaende;
	
	@Override
	public String toString() {
		return "Konto [name=" + name + ", art=" + art + ", waehrung=" + waehrung + ", bilanzPosition=" + bilanzPosition
				+ ", saldo=" + saldo + ", datum=" + datum + ", bestaende=" + bestaende + "]";
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
	public List<Bestand> getBestaende() {
		return bestaende;
	}
	public void setBestaende(List<Bestand> bestaende) {
		this.bestaende = bestaende;
	}
}
