package de.tmosebach.slowen.buchhaltung.builder;

import java.math.BigDecimal;
import java.time.LocalDate;

import de.tmosebach.slowen.buchhaltung.Buchung;
import de.tmosebach.slowen.buchhaltung.BuchungArt;
import de.tmosebach.slowen.buchhaltung.Umsatz;
import de.tmosebach.slowen.shared.values.AssetIdentifier;
import de.tmosebach.slowen.shared.values.Betrag;
import de.tmosebach.slowen.shared.values.KontoIdentifier;

public class VerkaufBuilder extends HandelBuilder {
	
	public VerkaufBuilder(LocalDate buchungsDatum, AssetIdentifier asset) {
		super(buchungsDatum, BuchungArt.Verkauf, asset);
	}

	public VerkaufBuilder ausDepot(KontoIdentifier depot) {
		this.depot = depot;
		return this;
	}

	public VerkaufBuilder menge(BigDecimal menge) {
		this.menge = menge;
		return this;
	}

	public VerkaufBuilder kurs(BigDecimal kurs) {
		this.kurs = kurs;
		return this;
	}

	public VerkaufBuilder zuGunsten(KontoIdentifier verrechnungsKonto) {
		this.verrechnungsKonto = verrechnungsKonto;
		return this;
	}
	
	public VerkaufBuilder verwendung(String verwendung) {
		buchung.setVerwendung(verwendung);
		return this;
	}

	public VerkaufBuilder empfaenger(String empfaenger) {
		buchung.setEmpfaenger(empfaenger);
		return this;
	}

	public HandelBuilder gebuehr(KontoIdentifier gebuehrenKonto, Betrag gebuehr) {
		buchung.addUmsatz(
				new Umsatz(buchung.getId(), gebuehrenKonto, valutaKonto, gebuehr));
		return this;
	}

	public Buchung build() {
		return super.build(false);
	}
}
