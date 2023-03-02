package de.tmosebach.slowen.buchhaltung.builder;

import java.math.BigDecimal;
import java.time.LocalDate;

import de.tmosebach.slowen.buchhaltung.Buchung;
import de.tmosebach.slowen.buchhaltung.BuchungArt;
import de.tmosebach.slowen.buchhaltung.Umsatz;
import de.tmosebach.slowen.shared.values.AssetIdentifier;
import de.tmosebach.slowen.shared.values.Betrag;
import de.tmosebach.slowen.shared.values.KontoIdentifier;

public class KaufBuilder extends HandelBuilder {

	public KaufBuilder(LocalDate buchungsDatum, AssetIdentifier asset) {
		super(buchungsDatum, BuchungArt.Kauf, asset);
	}

	public KaufBuilder insDepot(KontoIdentifier depot) {
		this.depot = depot;
		return this;
	}

	public KaufBuilder menge(BigDecimal menge) {
		this.menge = menge;
		return this;
	}

	public KaufBuilder kurs(BigDecimal kurs) {
		this.kurs = kurs;
		return this;
	}

	public KaufBuilder zuLasten(KontoIdentifier verrechnungsKonto) {
		this.verrechnungsKonto = verrechnungsKonto;
		return this;
	}
	
	public KaufBuilder verwendung(String verwendung) {
		buchung.setVerwendung(verwendung);
		return this;
	}

	public KaufBuilder empfaenger(String empfaenger) {
		buchung.setEmpfaenger(empfaenger);
		return this;
	}

	public KaufBuilder gebuehr(KontoIdentifier gebuehrenKonto, Betrag gebuehr) {
		buchung.addUmsatz(
				new Umsatz(buchung.getId(), gebuehrenKonto, valutaKonto, gebuehr));
		return this;
	}
	
	public Buchung build() {
		return super.build(true);
	}
}
