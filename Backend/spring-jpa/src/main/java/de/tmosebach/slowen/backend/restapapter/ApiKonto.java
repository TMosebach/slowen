package de.tmosebach.slowen.backend.restapapter;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(NON_NULL)
public class ApiKonto {

	private String id;
	private String name;
	private ApiKontoTyp typ;
	private ApiBilanzTyp bilanzTyp;
	private BigDecimal saldo;
	private String iban;
	private String bic;
	private String bank;
	private String nummer;
	private String gueltigBis;
	private List<ApiBestand> bestaende;
	public String getId() {
		return id;
	}
	public void setId(String id) {
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
	public String getGueltigBis() {
		return gueltigBis;
	}
	public void setGueltigBis(String gueltigBis) {
		this.gueltigBis = gueltigBis;
	}
	public List<ApiBestand> getBestaende() {
		return bestaende;
	}
	public void setBestaende(List<ApiBestand> bestaende) {
		this.bestaende = bestaende;
	}
}
