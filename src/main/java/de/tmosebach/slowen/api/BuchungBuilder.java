package de.tmosebach.slowen.api;

import static java.util.Objects.nonNull;
import static de.tmosebach.slowen.values.Vorgang.*;

import java.math.BigDecimal;
import java.time.LocalDate;

import de.tmosebach.slowen.Utils;
import de.tmosebach.slowen.domain.Buchung;
import de.tmosebach.slowen.domain.DepotUmsatz;
import de.tmosebach.slowen.domain.KontoUmsatz;
import de.tmosebach.slowen.values.KontoArt;
import de.tmosebach.slowen.values.Vorgang;

public class BuchungBuilder {

	private Buchung buchung;

	public static BuchungBuilder newBuchung(
			LocalDate datum,
			String empfaenfer,
			String verwendung) {
		
		if (nonNull(id)) {
			return createBuilder(
					Buchung, Utils.createId(), datum, empfaenfer, verwendung);
		}
		
		return createBuilder(
				Buchung, datum, empfaenfer, verwendung);
	}
	
	public static BuchungBuilder newBuchung(
			String id,
			LocalDate datum,
			String empfaenfer,
			String verwendung) {
		
		if (nonNull(id)) {
			return createBuilder(
					Buchung, id, datum, empfaenfer, verwendung);
		}
		
		return createBuilder(
				Buchung, datum, empfaenfer, verwendung);
	}
	
	public static BuchungBuilder newEinlieferung(
			LocalDate datum,
			String verwendung) {
		return createBuilder(
				Einlieferung, 
				datum,
				null, // kein Empfänger
				verwendung);
	}
	
	public static BuchungBuilder newKauf(
			LocalDate datum,
			String verwendung) {
		return createBuilder(
				Kauf, 
				datum,
				null, // kein Empfänger
				verwendung);
	}
	
	public static BuchungBuilder newErtrag(
			LocalDate datum,
			String verwendung) {
		return createBuilder(
				Ertrag, 
				datum,
				null, // kein Empfänger
				verwendung);
	}
	
	public static BuchungBuilder newVerkauf(
			LocalDate datum,
			String verwendung) {
		return createBuilder(
				Verkauf, 
				datum,
				null, // kein Empfänger
				verwendung);
	}
	
	public static BuchungBuilder newTilgung(
			LocalDate datum,
			String verwendung) {
		
		return createBuilder(
				Tilgung, 
				datum,
				null, // kein Empfänger
				verwendung);
	}

	private static BuchungBuilder createBuilder(
			Vorgang vorgang,
			LocalDate datum,
			String empfaenger,
			String verwendung) {
		return createBuilder(
				vorgang,
				Utils.createId(),
				datum,
				empfaenger,
				verwendung);
	}
	
	private static BuchungBuilder createBuilder(
			Vorgang vorgang,
			String id,
			LocalDate datum,
			String empfaenger,
			String verwendung) {
		BuchungBuilder builder = new BuchungBuilder();
		builder.createBuchung(
				vorgang,
				id,
				datum,
				empfaenger,
				verwendung);
		return builder;
	}
	
	public BuchungBuilder createBuchung(
			Vorgang vorgang,
			String id,
			LocalDate datum,
			String empfaenger,
			String verwendung) {
		
		buchung = new Buchung();
		buchung.setVorgang(vorgang);
		buchung.setId(id);
		buchung.setDatum(datum);
		buchung.setEmpfaenger(empfaenger);
		buchung.setVerwendung(verwendung);
		
		return this;
	}
	
	public BuchungBuilder addKontoUmsatz(String kontoName, LocalDate valuta, BigDecimal betrag) {
		KontoUmsatz umsatz = new KontoUmsatz();
		umsatz.setArt(KontoArt.Konto);
		umsatz.setKonto(kontoName);
		umsatz.setValuta(valuta);
		umsatz.setBetrag(betrag);
		
		buchung.addUmsatz(umsatz);
		
		return this;
	}
	
	public BuchungBuilder addDepotUmsatz(
			String depot,
			String isin,
			BigDecimal betrag,
			LocalDate valuta,
			BigDecimal menge) {
		
		DepotUmsatz umsatz = new DepotUmsatz();
		umsatz.setArt(KontoArt.Depot);
		umsatz.setKonto(depot);
		umsatz.setAsset(isin);
		umsatz.setBetrag(betrag);
		umsatz.setValuta(valuta);
		umsatz.setMenge(menge);
		
		buchung.addUmsatz(umsatz);
		
		return this;
	}
 	
	public Buchung getBuchung() {
		return buchung;
	}
	
	private BuchungBuilder() {}
}
