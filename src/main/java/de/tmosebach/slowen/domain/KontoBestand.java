package de.tmosebach.slowen.domain;

import java.math.BigDecimal;
import java.time.LocalDate;

public class KontoBestand {

	private String name;
	private LocalDate datum;
	private BigDecimal saldo;
	
	public KontoBestand(String name, LocalDate datum, BigDecimal saldo) {
		this.name = name;
		this.datum = datum;
		this.saldo = saldo;
	}
	@Override
	public String toString() {
		return "KontoBestand [name=" + name + ", datum=" + datum + ", saldo=" + saldo + "]";
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public LocalDate getDatum() {
		return datum;
	}
	public void setDatum(LocalDate datum) {
		this.datum = datum;
	}
	public BigDecimal getSaldo() {
		return saldo;
	}
	public void setSaldo(BigDecimal saldo) {
		this.saldo = saldo;
	}
}
