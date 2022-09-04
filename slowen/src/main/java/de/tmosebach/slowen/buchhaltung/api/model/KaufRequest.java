package de.tmosebach.slowen.buchhaltung.api.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public class KaufRequest {
	
	private LocalDate buchungsDatum;

	@Size( min = 0, max = 50)
	private String verwendung;
	
	@Size( min = 0, max = 50)
	private String empfaenger;
	
	@Size( min=36, max=36)
	@NotNull
	private String asset;
	
	@Size( min=36, max=36)
	@NotNull
	private String depot;
	
	@NotNull
	private BigDecimal menge;
	
	@NotNull
	private BigDecimal kurs;
	
	@Size( min=36, max=36)
	@NotNull
	private String verrechnungskonto;
	
	private List<KontoBuchungen> gebuehren = new ArrayList<>();

	@Override
	public String toString() {
		return "KaufCommand [buchungsDatum=" + buchungsDatum + ", verwendung=" + verwendung + ", empfaenger="
				+ empfaenger + ", asset=" + asset + ", depot=" + depot + ", menge=" + menge + ", kurs=" + kurs
				+ ", verrechnungskonto=" + verrechnungskonto + ", gebuehren=" + gebuehren + "]";
	}

	public LocalDate getBuchungsDatum() {
		return buchungsDatum;
	}

	public void setBuchungsDatum(LocalDate buchungsDatum) {
		this.buchungsDatum = buchungsDatum;
	}

	public String getVerwendung() {
		return verwendung;
	}

	public void setVerwendung(String verwendung) {
		this.verwendung = verwendung;
	}

	public String getEmpfaenger() {
		return empfaenger;
	}

	public void setEmpfaenger(String empfaenger) {
		this.empfaenger = empfaenger;
	}

	public String getAsset() {
		return asset;
	}

	public void setAsset(String asset) {
		this.asset = asset;
	}

	public String getDepot() {
		return depot;
	}

	public void setDepot(String depot) {
		this.depot = depot;
	}

	public BigDecimal getMenge() {
		return menge;
	}

	public void setMenge(BigDecimal menge) {
		this.menge = menge;
	}

	public BigDecimal getKurs() {
		return kurs;
	}

	public void setKurs(BigDecimal kurs) {
		this.kurs = kurs;
	}

	public String getVerrechnungskonto() {
		return verrechnungskonto;
	}

	public void setVerrechnungskonto(String verrechnungskonto) {
		this.verrechnungskonto = verrechnungskonto;
	}

	public List<KontoBuchungen> getGebuehren() {
		return gebuehren;
	}

	public void setGebuehren(List<KontoBuchungen> gebuehren) {
		this.gebuehren = gebuehren;
	}
}
