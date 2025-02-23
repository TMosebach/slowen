package de.tmosebach.slowen.converter.mapper;

import static java.util.Objects.nonNull;

import java.math.BigDecimal;

import static java.math.BigDecimal.ZERO;

import java.text.DecimalFormat;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import de.tmosebach.slowen.api.input.Buchung;
import de.tmosebach.slowen.api.input.BuchungWrapper;
import de.tmosebach.slowen.api.input.Ertrag;
import de.tmosebach.slowen.api.input.Ertragsart;
import de.tmosebach.slowen.api.input.Kauf;
import de.tmosebach.slowen.api.input.Umsatz;
import de.tmosebach.slowen.converter.EingabeTyp;
import de.tmosebach.slowen.domain.Asset;
import de.tmosebach.slowen.domain.AssetService;
import de.tmosebach.slowen.values.AssetTyp;
import de.tmosebach.slowen.values.Vorgang;

@Component
public class ComdirectMapper implements IMapper {
	
	static final int COL_BUCHUNGSDATUM = 0;
	static final int COL_VALUTA = 1;
	static final int COL_VORGANG = 2;
	static final int COL_BUCHUNGSTEXT = 3;
	static final int COL_BETRAG = 4;
	
	private static DecimalFormat betragFormat;
	
	private AssetService assetService;

	public ComdirectMapper(AssetService assetService) {
		this.assetService = assetService;
	}

	@Override
	public BuchungWrapper map(String zielKonto, String... fields) {
		
		betragFormat = new DecimalFormat(BETRAG_FORMAT_PATTERN);
		betragFormat.setParseBigDecimal(true);
		
		fields = entferneGaensefuesse(fields);
		
		BuchungWrapper wrapper = new BuchungWrapper();
		switch(fields[COL_VORGANG]) {
			case "Wertpapierkauf":
			case "Wertpapiergutschrift":
			case "Zins / Dividende WP":
			case "Zins/Dividende":
			case "Abschluss", "Solidaritätszuschlag", "Kapitalertragsteuer": 
				throw new UnsupportedOperationException();
			case "Kupon":
				wrapper.setVorgang(Vorgang.Ertrag);
				wrapper.setErtrag(mapErtrag(zielKonto, fields));
				break;
			case "Wertpapiere":
				
				BigDecimal betrag = mapBetrag(fields[COL_BETRAG]);
				if (BigDecimal.ZERO.compareTo(betrag) > 0) {
					wrapper.setVorgang(Vorgang.Kauf);
					wrapper.setKauf(mapKauf(zielKonto, betrag.negate(), fields));
				} else {
					wrapper.setVorgang(Vorgang.Verkauf);
					// TODO Verkauf
				}
				
				break;
			default:
				wrapper.setVorgang(Vorgang.Buchung);
				wrapper.setBuchung(mapBuchung(zielKonto, fields));
		}
		
		return wrapper;
	}

	private Kauf mapKauf(String zielKonto, BigDecimal betrag, String[] fields) {
		Kauf kauf = new Kauf();
		kauf.setDepot("Comdirect Depot");
		kauf.setKonto(zielKonto);
		
		kauf.setDatum(mapDate(fields[COL_BUCHUNGSDATUM]));
		kauf.setValuta(mapDate(fields[COL_VALUTA]));
		kauf.setBetrag(betrag);
		
		String buchungstext = fields[COL_BUCHUNGSTEXT];
		findAssetByWpk(buchungstext)
		.ifPresent( asset -> kauf.setAsset(asset.getIsin()));
		
		return kauf;
	}

	private Ertrag mapErtrag(String zielKonto, String[] fields) {
		Ertrag ertrag = new Ertrag();
		ertrag.setDepot("Comdirect Depot");
		ertrag.setKonto(zielKonto);
		
		ertrag.setSoli(ZERO);
		ertrag.setKest(ZERO);
		
		ertrag.setDatum(mapDate(fields[COL_BUCHUNGSDATUM]));
		ertrag.setValuta(mapDate(fields[COL_VALUTA]));
		ertrag.setBetrag(mapBetrag(fields[COL_BETRAG]));
		
		String buchungstext = fields[COL_BUCHUNGSTEXT];
		
		Optional<Asset> assetOptional = findAssetByWpk(buchungstext);
		
		if (assetOptional.isPresent()) {
			Asset asset = assetOptional.get();
			ertrag.setAsset(asset.getIsin());
			
			switch (asset.getTyp()) {
				case AssetTyp.Aktie -> ertrag.setErtragsart(Ertragsart.Dividende);
				case AssetTyp.Anleihe -> ertrag.setErtragsart(Ertragsart.Zins);
				case AssetTyp.ETF -> ertrag.setErtragsart(Ertragsart.Fondsertrag);
				case AssetTyp.Fonds -> ertrag.setErtragsart(Ertragsart.Fondsertrag);
				case AssetTyp.Zertifikat -> ertrag.setErtragsart(Ertragsart.Fondsertrag);
				
				default -> ertrag.setErtragsart(Ertragsart.Fondsertrag);
			}

		} else {
			// Das passt nicht wirklich, Sonstige Erträge? Relevant?
			ertrag.setErtragsart(Ertragsart.Fondsertrag);
		}

		return ertrag;
	}

	private Optional<Asset> findAssetByWpk(String buchungstext) {
		List<Asset> assets = assetService.getAssets();
		Optional<Asset> assetOptional = 
				assets.stream()
				.filter( aAsset -> nonNull(aAsset.getWpk()))
				.filter( aAsset -> buchungstext.contains(aAsset.getWpk()))
				.findFirst();
		return assetOptional;
	}

	private Buchung mapBuchung(String zielKonto, String[] fields) {
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
			buchung.setUmsaetze( List.of(umsatz, gegenUmsatz) );

			buchung.setVerwendung(fields[COL_BUCHUNGSTEXT]);

			return buchung;
	}

	private String[] entferneGaensefuesse(String[] fields) {
		for (int i = 0; i < fields.length; i++) {
			if (fields[i].startsWith("\"") ) {
				String original = fields[i];
				fields[i] = original.substring(1, original.length()-1);
			} 
		}
		return fields;
	}

	@Override
	public EingabeTyp getTyp() {
		return EingabeTyp.COMDIRECT;
	}

	@Override
	public int getAnzahlKopfzeilen() {
		return 5;
	}

}
