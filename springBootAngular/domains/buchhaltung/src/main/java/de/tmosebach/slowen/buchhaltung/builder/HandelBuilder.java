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

public abstract class HandelBuilder extends BuchungBuilder {

	protected AssetIdentifier asset;
	protected LocalDate valutaDepot;
	protected LocalDate valutaKonto;
	protected KontoIdentifier depot;
	protected BigDecimal menge;
	protected BigDecimal kurs;
	protected KontoIdentifier verrechnungsKonto;

	public HandelBuilder(LocalDate buchungsDatum, BuchungArt art, AssetIdentifier asset) {
		this.buchungsDatum = buchungsDatum;
		this.asset = asset;
		
		this.valutaDepot = buchungsDatum.plusDays(1L);
		this.valutaKonto = buchungsDatum.plusDays(2L);

		String id = createId();

		buchung = 
			new Buchung(
				new BuchungIdentifier(id), art, buchungsDatum);
	}
	
	protected Buchung build(boolean isZugang) {
		
		Betrag summeGebuehr = 
			buchung.getUmsaetze().stream()
			.map( umsatz -> umsatz.getBetrag())
			.reduce(Betrag.NULL_EUR, (a, b) -> a.add(b));
		
		Betrag wert = 
				new Betrag( 
					menge.multiply(kurs), 
					summeGebuehr.getWaehrung());
		
		buchung.addUmsatz(
			new Umsatz(
				buchung.getId(),
				depot,
				valutaDepot,
				isZugang?wert:wert.invert(),
				asset,
				isZugang?menge:menge.negate()));
		
		buchung.addUmsatz(
			new Umsatz(
					buchung.getId(),
					verrechnungsKonto,
					valutaKonto,
					isZugang
						?wert.add(summeGebuehr).invert()
						:wert.subtract(summeGebuehr) ) );
		
		return buchung;
	}
}
