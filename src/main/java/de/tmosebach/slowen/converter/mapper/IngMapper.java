package de.tmosebach.slowen.converter.mapper;

import static java.math.BigDecimal.ZERO;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import de.tmosebach.slowen.api.input.Buchung;
import de.tmosebach.slowen.api.input.BuchungWrapper;
import de.tmosebach.slowen.api.input.Ertrag;
import de.tmosebach.slowen.api.input.Ertragsart;
import de.tmosebach.slowen.api.input.Umsatz;
import de.tmosebach.slowen.domain.Asset;
import de.tmosebach.slowen.domain.AssetService;
import de.tmosebach.slowen.values.AssetTyp;
import de.tmosebach.slowen.values.Vorgang;

public class IngMapper {
	
	private static final String BETRAG_FORMAT_PATTERN = "#,##0.00";
	
	private static DecimalFormat betragFormat;

	static final int COL_BUCHUNGSDATUM = 0;
	static final int COL_VALUTA = 1;
	static final int COL_EMPFAENGER = 2;
	static final int COL_BUCHUNGSTEXT = 3;
	static final int COL_VERWENDUNG = 4;
	static final int COL_BETRAG = 7;

	public static BuchungWrapper map(String zielKonto, AssetService assetService, String... fields) {
		
		betragFormat = new DecimalFormat(BETRAG_FORMAT_PATTERN);
		betragFormat.setParseBigDecimal(true);
		
		BuchungWrapper wrapper = new BuchungWrapper();

		switch(fields[COL_BUCHUNGSTEXT]) {
			case "Wertpapierkauf":
				return wrapper; // TODO kaufCommandFactory.buildCommand(fields);
			case "Wertpapiergutschrift": // Verkauf oder Tilgung
				String verwendung = fields[COL_VERWENDUNG];
				if(verwendung.contains("Verkauf")) {
					return wrapper; // TODO verkaufCommandFactory.buildCommand(fields);
				}
				return wrapper; // TODO tilgungCommandFactory.buildCommand(fields);
			case "Zins / Dividende WP":
			case "Zins/Dividende":
				wrapper.setVorgang(Vorgang.Ertrag);
				wrapper.setErtrag(mapErtrag(zielKonto, assetService, fields));
				break;
			case "Abschluss", "Solidaritätszuschlag", "Kapitalertragsteuer": // Spezielle Buchung
				return wrapper; // TODO spezieleBuchungCommandFactory.buildCommand(fields);
			default:
				wrapper.setVorgang(Vorgang.Buchung);
				wrapper.setBuchung(mapBuchung(zielKonto, fields));
		}
		return wrapper;
	}
	
	private static Ertrag mapErtrag(String zielKonto, AssetService assetService, String[] fields) {
		
		Ertrag ertrag = new Ertrag();
		ertrag.setDepot("ING Depot");
		ertrag.setKonto(zielKonto);
		
		ertrag.setSoli(ZERO);
		ertrag.setKest(ZERO);
		
		ertrag.setDatum(mapDate(fields[COL_BUCHUNGSDATUM]));
		ertrag.setValuta(mapDate(fields[COL_VALUTA]));
		ertrag.setBetrag(mapBetrag(fields[COL_BETRAG]));
		
		//
		String verwendung = fields[COL_VERWENDUNG];
		String isin = verwendung.substring(20, 32);
		ertrag.setAsset(isin);
		
		//
		Asset asset = assetService.findAssetByIsin(isin).orElseThrow();
		if (asset.getTyp() == AssetTyp.Aktie) {
			ertrag.setErtragsart(Ertragsart.Dividende);
		} else {
			ertrag.setErtragsart(Ertragsart.Zins);
		}

		return ertrag;
	}

	private static Buchung mapBuchung(String zielKonto, String[] fields) {
		Umsatz umsatz = new Umsatz();
		umsatz.setKonto(zielKonto);
		umsatz.setValuta(mapDate(fields[COL_VALUTA]));
		umsatz.setBetrag(mapBetrag(fields[COL_BETRAG]));
		
		Umsatz gegenUmsatz = new Umsatz();
		gegenUmsatz.setKonto("???");
		gegenUmsatz.setValuta(umsatz.getValuta());
		gegenUmsatz.setBetrag(umsatz.getBetrag().negate());
		
		Buchung buchung = new Buchung();
		buchung.setDatum(mapDate(fields[COL_BUCHUNGSDATUM]));
		buchung.setEmpfaenger(fields[COL_EMPFAENGER]);
		buchung.setVerwendung(fields[COL_VERWENDUNG]);
		buchung.setUmsaetze( List.of(umsatz, gegenUmsatz) );

		return buchung;
	}

	private static LocalDate mapDate(String dateString) {
		return LocalDate.parse(dateString, DateTimeFormatter.ofPattern("dd.MM.uuuu"));
	}
	
	private static BigDecimal mapBetrag(String betragString) {
		try {
			return (BigDecimal)betragFormat.parse(betragString);
		} catch (ParseException e) {
			throw new IllegalArgumentException(e);
		}
	}
}
