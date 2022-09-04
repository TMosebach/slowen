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

public class VerkaufBuilder {
	
	private Buchung buchung;
	private LocalDate buchungsDatum;
	private LocalDate valutaDepot;
	private LocalDate valutaKonto;
	
	private AssetIdentifier asset;
	private KontoIdentifier depot;
	private BigDecimal menge;
	private BigDecimal kurs;
	private KontoIdentifier verrechnungsKonto;

	public VerkaufBuilder(LocalDate buchungsDatum) {
		this.buchungsDatum = buchungsDatum;
		this.valutaDepot = buchungsDatum.plusDays(1L);
		this.valutaKonto = buchungsDatum.plusDays(2L);
	}

	public VerkaufBuilder verkauf(AssetIdentifier asset) {
		this.asset = asset;
				
		String id = createId();

		buchung = 
			new Buchung(
				new BuchungIdentifier(id),
				BuchungArt.Kauf,
				buchungsDatum);
		
		return this;
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

	public VerkaufBuilder gebuehr(KontoIdentifier gebuehrenKonto, Betrag gebuehr) {
		buchung.addUmsatz(
				new Umsatz(buchung.getId(), gebuehrenKonto, valutaKonto, gebuehr));
		return this;
	}

	public Buchung build() {
		
		Betrag summeGebuehr = 
			buchung.getUmsaetze().stream()
			.map( umsatz -> umsatz.getBetrag())
			.reduce(Betrag.NULL_EUR, (a, b) -> a.add(b));
		
		Betrag verkaufWert = 
				new Betrag( 
					menge.multiply(kurs), 
					summeGebuehr.getWaehrung());
		
		buchung.addUmsatz(
			new Umsatz(
				buchung.getId(),
				depot,
				valutaDepot,
				verkaufWert.invert(),
				asset,
				menge.negate()));
		
		buchung.addUmsatz(
			new Umsatz(
					buchung.getId(),
					verrechnungsKonto,
					valutaKonto,
					verkaufWert.subtract(summeGebuehr) ) );
		
		return buchung;
	}

}
