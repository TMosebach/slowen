package de.tmosebach.slowen.backend.restapapter;

import java.math.BigDecimal;
import java.util.List;

import de.tmosebach.slowen.backend.domain.Bestand;

public class ApiKonto {

	private Long id;
	private String name;
	private ApiKontoTyp typ;
	private ApiBilanzTyp bilanzTyp;
	private BigDecimal saldo = BigDecimal.ZERO;
	private String iban;
	private String bic;
	private String bank;
	private String nummer;
	private List<ApiUmsatz> umsaetze;
	private List<Bestand> bestaende;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public ApiKontoTyp getTyp() {
		return typ;
	}
	public void setTyp(ApiKontoTyp typ) {
		this.typ = typ;
	}
	public ApiBilanzTyp getBilanzTyp() {
		return bilanzTyp;
	}
	public void setBilanzTyp(ApiBilanzTyp bilanzTyp) {
		this.bilanzTyp = bilanzTyp;
	}
	public BigDecimal getSaldo() {
		return saldo;
	}
	public void setSaldo(BigDecimal saldo) {
		this.saldo = saldo;
	}
	public String getIban() {
		return iban;
	}
	public void setIban(String iban) {
		this.iban = iban;
	}
	public String getBic() {
		return bic;
	}
	public void setBic(String bic) {
		this.bic = bic;
	}
	public String getBank() {
		return bank;
	}
	public void setBank(String bank) {
		this.bank = bank;
	}
	public String getNummer() {
		return nummer;
	}
	public void setNummer(String nummer) {
		this.nummer = nummer;
	}
	public List<ApiUmsatz> getUmsaetze() {
		return umsaetze;
	}
	public void setUmsaetze(List<ApiUmsatz> umsaetze) {
		this.umsaetze = umsaetze;
	}
	public List<Bestand> getBestaende() {
		return bestaende;
	}
	public void setBestaende(List<Bestand> bestaende) {
		this.bestaende = bestaende;
	}
}
