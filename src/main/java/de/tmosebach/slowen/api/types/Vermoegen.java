package de.tmosebach.slowen.api.types;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class Vermoegen {

	private BigDecimal summe = BigDecimal.ZERO;
	private List<Konto> konten = new ArrayList<>();
	private List<Bestand> bestaende = new ArrayList<>();
	@Override
	public String toString() {
		return "Vermoegen [summe=" + summe + ", konten=" + konten + ", bestaende=" + bestaende + "]";
	}
	public void addKonto(Konto konto) {
		konten.add(konto);
		summe = summe.add(konto.getSaldo());
	}
	public void addBestaende(Konto konto) {
		konto.getBestaende().forEach( bestand -> {
			bestand.setDepot(konto.getName());
			
			bestaende.add(bestand);
			
			summe = summe.add(bestand.getWert());
		});
	}
	public BigDecimal getSumme() {
		return summe;
	}
	public void setSumme(BigDecimal summe) {
		this.summe = summe;
	}
	public List<Konto> getKonten() {
		return konten;
	}
	public void setKonten(List<Konto> konten) {
		this.konten = konten;
	}
	public List<Bestand> getBestaende() {
		return bestaende;
	}
	public void setBestaende(List<Bestand> bestaende) {
		this.bestaende = bestaende;
	}
}
