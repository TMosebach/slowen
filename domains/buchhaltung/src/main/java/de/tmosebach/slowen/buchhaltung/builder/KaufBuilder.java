package de.tmosebach.slowen.buchhaltung.builder;

import static de.tmosebach.slowen.shared.values.Functions.createId;

import java.math.BigDecimal;
import java.time.LocalDate;

import de.tmosebach.slowen.buchhaltung.Buchung;
import de.tmosebach.slowen.buchhaltung.BuchungArt;
import de.tmosebach.slowen.buchhaltung.BuchungIdentifier;
import de.tmosebach.slowen.buchhaltung.Umsatz;
import de.tmosebach.slowen.shared.values.AssetIdentifier;
import de.tmosebach.slowen.shared.values.Betrag;
import de.tmosebach.slowen.shared.values.KontoIdentifier;

public class KaufBuilder {
	
	private Buchung buchung;
	private LocalDate buchungsDatum;
	private LocalDate valutaDepot;
	private LocalDate valutaKonto;
	
	private AssetIdentifier asset;
	private KontoIdentifier depot;
	private BigDecimal menge;
	private BigDecimal kurs;
	private KontoIdentifier verrechnungsKonto;

	public KaufBuilder(LocalDate buchungsDatum) {
		this.buchungsDatum = buchungsDatum;
		this.valutaDepot = buchungsDatum.plusDays(1L);
		this.valutaKonto = buchungsDatum.plusDays(2L);
	}

	public KaufBuilder kauf(AssetIdentifier asset) {
		this.asset = asset;
				
		String id = createId();

		buchung = 
			new Buchung(
				new BuchungIdentifier(id),
				BuchungArt.Kauf,
				buchungsDatum);
		
		return this;
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
		
		Betrag summeGebuehr = 
			buchung.getUmsaetze().stream()
			.map( umsatz -> umsatz.getBetrag())
			.reduce(Betrag.NULL_EUR, (a, b) -> a.add(b));
		
		Betrag kaufWert = 
				new Betrag( 
					menge.multiply(kurs), 
					summeGebuehr.getWaehrung());
		
		buchung.addUmsatz(
			new Umsatz(
				buchung.getId(),
				depot,
				valutaDepot,
				kaufWert,
				asset,
				menge));
		
		buchung.addUmsatz(
			new Umsatz(
					buchung.getId(),
					verrechnungsKonto,
					valutaKonto,
					kaufWert.add(summeGebuehr).invert() ) );
		
		return buchung;
	}

}
