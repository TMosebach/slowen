package de.tmosebach.slowen.domain;

import java.math.BigDecimal;
import java.time.LocalDate;

import de.tmosebach.slowen.values.KontoArt;

public abstract class Umsatz {
	protected String konto;
	protected KontoArt art;
	protected LocalDate valuta;
	protected BigDecimal betrag;
	protected Buchung buchung;

	@Override
	public String toString() {
		return "KontoUmsatz [konto=" + konto + ", art=" + art + ", valuta=" + valuta + ", betrag=" + betrag + "]";
	}

	public String getKonto() {
		return konto;
	}

	public void setKonto(String konto) {
		this.konto = konto;
	}

	public LocalDate getValuta() {
		return valuta;
	}

	public void setValuta(LocalDate valuta) {
		this.valuta = valuta;
	}

	public BigDecimal getBetrag() {
		return betrag;
	}

	public void setBetrag(BigDecimal betrag) {
		this.betrag = betrag;
	}

	public KontoArt getArt() {
		return art;
	}

	public void setArt(KontoArt art) {
		this.art = art;
	}

	public Buchung getBuchung() {
		return buchung;
	}

	public void setBuchung(Buchung buchung) {
		this.buchung = buchung;
	}
}
