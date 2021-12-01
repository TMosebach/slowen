package de.tmosebach.slowen.buchhaltung.api;

import java.math.BigDecimal;
import java.util.List;

import javax.validation.constraints.NotBlank;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import de.tmosebach.slowen.buchhaltung.model.KontoArt;

@JsonInclude(Include.NON_NULL)
public class Konto {

	private String type = "Konto";
	private String id;
	@NotBlank(message = "Eine eindeutige Kontobenennung ist pflicht")
	private String name;
	private KontoArt art;
	private BigDecimal saldo;
	private Konto verrechnungskonto;
	private List<Bestand> bestaende;
	
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
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
	public KontoArt getArt() {
		return art;
	}
	public void setArt(KontoArt art) {
		this.art = art;
	}
	public BigDecimal getSaldo() {
		return saldo;
	}
	public void setSaldo(BigDecimal saldo) {
		this.saldo = saldo;
	}
	public Konto getVerrechnungskonto() {
		return verrechnungskonto;
	}
	public void setVerrechnungskonto(Konto verrechnungskonto) {
		this.verrechnungskonto = verrechnungskonto;
	}
	public List<Bestand> getBestaende() {
		return bestaende;
	}
	public void setBestaende(List<Bestand> bestaende) {
		this.bestaende = bestaende;
	}
}
