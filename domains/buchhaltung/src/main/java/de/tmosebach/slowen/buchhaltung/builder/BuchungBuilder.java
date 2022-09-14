package de.tmosebach.slowen.buchhaltung.builder;

import static de.tmosebach.slowen.shared.values.Functions.createId;

import java.time.LocalDate;

import de.tmosebach.slowen.buchhaltung.Buchung;
import de.tmosebach.slowen.buchhaltung.BuchungArt;
import de.tmosebach.slowen.buchhaltung.BuchungIdentifier;
import de.tmosebach.slowen.buchhaltung.Umsatz;
import de.tmosebach.slowen.shared.values.AssetIdentifier;
import de.tmosebach.slowen.shared.values.Betrag;
import de.tmosebach.slowen.shared.values.KontoIdentifier;

public class BuchungBuilder {
	
	public static BuchungBuilder buche(LocalDate buchungsDatum) {
		return new BuchungBuilder(buchungsDatum);
	}
	
	public static KaufBuilder kauf(LocalDate buchungsDatum, AssetIdentifier asset) {
		return new KaufBuilder(buchungsDatum, asset);
	}
	
	public static VerkaufBuilder verkauf(LocalDate buchungsDatum, AssetIdentifier asset) {
		return new VerkaufBuilder(buchungsDatum, asset);
	}
	
	protected Buchung buchung;
	protected LocalDate buchungsDatum;

	protected BuchungBuilder() {}
	
	private BuchungBuilder(LocalDate buchungsDatum) {
		this.buchungsDatum = buchungsDatum;
		
		String id = createId();
		
		buchung = 
			new Buchung(
				new BuchungIdentifier(id),
				BuchungArt.Buchung,
				buchungsDatum);
	}

	public Buchung build() {
		return buchung;
	}

	public BuchungBuilder umsatz(KontoIdentifier konto, Betrag betrag) {
		return umsatz(konto, LocalDate.now(), betrag);
	}

	public BuchungBuilder umsatz(KontoIdentifier konto, LocalDate valuta, Betrag betrag) {
		buchung.addUmsatz( new Umsatz(buchung.getId(), konto, valuta, betrag) );
		return this;
	}

	public BuchungBuilder verwendung(String verwendung) {
		buchung.setVerwendung(verwendung);
		return this;
	}

	public BuchungBuilder empfaenger(String empfaenger) {
		buchung.setEmpfaenger(empfaenger);
		return this;
	}
}
