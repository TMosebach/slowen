package de.tmosebach.slowen.converter.mapper;

import java.text.DecimalFormat;
import java.util.List;

import org.springframework.stereotype.Component;

import de.tmosebach.slowen.api.input.Buchung;
import de.tmosebach.slowen.api.input.BuchungWrapper;
import de.tmosebach.slowen.api.input.Umsatz;
import de.tmosebach.slowen.converter.EingabeTyp;
import de.tmosebach.slowen.values.Vorgang;

@Component
public class ComdirectMapper implements IMapper {
	
	static final int COL_BUCHUNGSDATUM = 0;
	static final int COL_VALUTA = 1;
	static final int COL_VORGANG = 2;
	static final int COL_BUCHUNGSTEXT = 3;
	static final int COL_BETRAG = 4;
	
	private static DecimalFormat betragFormat;

	@Override
	public BuchungWrapper map(String zielKonto, String... fields) {
		
		betragFormat = new DecimalFormat(BETRAG_FORMAT_PATTERN);
		betragFormat.setParseBigDecimal(true);
		
		BuchungWrapper wrapper = new BuchungWrapper();
		switch(fields[COL_BUCHUNGSTEXT]) {
			case "Wertpapierkauf":
			case "Wertpapiergutschrift":
			case "Zins / Dividende WP":
			case "Zins/Dividende":
			case "Abschluss", "Solidaritätszuschlag", "Kapitalertragsteuer": 
				throw new UnsupportedOperationException();
			default:
				wrapper.setVorgang(Vorgang.Buchung);
				wrapper.setBuchung(mapBuchung(zielKonto, fields));
		}
		
		return wrapper;
	}

	private Buchung mapBuchung(String zielKonto, String[] fields) {
			fields = entZitieren(fields);
		
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
			
			String text = fields[COL_BUCHUNGSTEXT];
			String empfaenger = text.substring(11, 26);
			String verwendung = text.substring(26);
			
			buchung.setEmpfaenger(empfaenger);
			buchung.setVerwendung(verwendung);

			return buchung;
	}

	private String[] entZitieren(String[] fields) {
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
