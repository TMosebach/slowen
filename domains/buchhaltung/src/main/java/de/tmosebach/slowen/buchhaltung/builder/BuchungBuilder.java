package de.tmosebach.slowen.buchhaltung.builder;

import static de.tmosebach.slowen.shared.values.Functions.createId;

import java.time.LocalDate;

import de.tmosebach.slowen.buchhaltung.Buchung;
import de.tmosebach.slowen.buchhaltung.BuchungArt;
import de.tmosebach.slowen.buchhaltung.BuchungIdentifier;
import de.tmosebach.slowen.buchhaltung.Umsatz;
import de.tmosebach.slowen.shared.values.Betrag;
import de.tmosebach.slowen.shared.values.KontoIdentifier;

public class BuchungBuilder {
	
	private Buchung buchung;
	private LocalDate buchungsDatum;

	public BuchungBuilder(LocalDate buchungsDatum) {
		this.buchungsDatum = buchungsDatum;
	}

	public BuchungBuilder buchung() {
		String id = createId();
		
		buchung = 
			new Buchung(
				new BuchungIdentifier(id),
				BuchungArt.Buchung,
				buchungsDatum);
		
		return this;
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
