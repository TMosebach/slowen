package de.tmosebach.slowen.converter;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;

import de.tmosebach.slowen.api.input.BuchungWrapper;
import de.tmosebach.slowen.converter.mapper.IMapper;
import de.tmosebach.slowen.domain.Buchung;
import de.tmosebach.slowen.domain.BuchungService;
import de.tmosebach.slowen.domain.Umsatz;
import de.tmosebach.slowen.values.Vorgang;

@Component
public class Converter {
	
	private ObjectMapper objectMapper;
	private BuchungService buchungService;
	
	private JsonGenerator generator;
	private Map<EingabeTyp, IMapper> mapper;
	
	/**
	 * Kopfzeilen für ING-Csv-Dateien
	 */
	private int offeneKopfzeilen = 0;
	
	private String zielKonto;

	public Converter(
			ObjectMapper objectMapper,
			BuchungService buchungService,
			List<IMapper> mapper) {
		this.objectMapper = objectMapper;
		this.buchungService = buchungService;
		
		this.mapper = new HashMap<>();
		mapper.forEach( m -> this.mapper.put(m.getTyp(), m));
	}

	public void convert(
			Stream<String> lines, 
			EingabeTyp typ, 
			String zielKonto, 
			Writer writer) {
		this.zielKonto = zielKonto;
		
		IMapper theMapper = mapper.get(typ);
		this.offeneKopfzeilen = theMapper.getAnzahlKopfzeilen();
		try {
			// XXX Entwicklung
//			OutputStreamWriter writer = new OutputStreamWriter(System.out);
			
			generator = objectMapper.createGenerator(writer);
			
			lines.filter( line -> isDatenzeile(line) )
				.map( this::toFields )
				.filter( fields -> fields.length > 1)
				.forEach( buchung -> toBuchung(buchung, theMapper, writer) );
		} catch (IOException e) {
			throw new RuntimeException(e.getMessage());
		}
	}
	
	private void toBuchung(String[] fields, IMapper mapper, Writer writer) {
		try {
			BuchungWrapper wrapper = mapper.map(zielKonto, fields);
			if (neueBuchung(wrapper)) {
				writer.append("TODO: "); // Marker, hier ist zu kontrollieren
				generator.writeObject(wrapper);
				writer.append(System.lineSeparator());
			}
		} catch (IOException e) {
			throw new RuntimeException(e.getMessage());
		}
	}
	
	/**
	 * Prüfen, ob eine Buchung ggf. schon auf dem Konto verbucht ist.
	 * 
	 * Das kann als Ergebnis einer Umbuchung von einem anderen Konto
	 * der Fall sein.
	 * 
	 * @param wrapper zu untersuchende Buchung
	 * @return {@code true}, falls die Buchung neu ist.
	 */
	private boolean neueBuchung(BuchungWrapper wrapper) {
		
		if (wrapper.getVorgang() != Vorgang.Buchung) {
			return true;
		}
		
		List<Buchung> buchungen = buchungService.findBuchungenZuKonto(zielKonto);
		if (match(buchungen, wrapper.getBuchung())) {
			return false;
		}
		return true;
	}

	private boolean match(List<Buchung> buchungen, de.tmosebach.slowen.api.input.Buchung buchung) {
		List<Buchung> treffer = 
			buchungen.stream()
			.filter( kontoBuchung -> matchesZielkonto(buchung, kontoBuchung))
			.toList();
		
		return treffer.size() == 1;
	}

	private boolean matchesZielkonto(de.tmosebach.slowen.api.input.Buchung buchung, Buchung kontoBuchung) {
		Umsatz umsatz = umsatzZielkonto(kontoBuchung);
		de.tmosebach.slowen.api.input.Umsatz neuUmsatz = umsatzZielkonto(buchung);
		
		return umsatz.getBetrag().compareTo(neuUmsatz.getBetrag()) == 0
				&& umsatz.getValuta().equals(neuUmsatz.getValuta());
	}

	private Umsatz umsatzZielkonto(Buchung buchung) {
		return buchung.getUmsaetze().stream()
				.filter( umsatz -> umsatz.getKonto().equals(zielKonto))
				.findFirst()
				.orElseThrow();
	}
	
	private de.tmosebach.slowen.api.input.Umsatz umsatzZielkonto(
			de.tmosebach.slowen.api.input.Buchung buchung) {
		return buchung.getUmsaetze().stream()
				.filter( umsatz -> umsatz.getKonto().equals(zielKonto))
				.findFirst()
				.orElseThrow();
	}

	private String[] toFields(String line) {
		return line.split(";");
	}

	private boolean isDatenzeile(String line) {
		if (offeneKopfzeilen > 0) {
			offeneKopfzeilen--;
			return false;
		}
		return true;
	}
	
	protected String extractIsin(String verwendung) {
		int indexIsin = verwendung.indexOf("ISIN");
		if (indexIsin >= 0) {
			return verwendung.substring(indexIsin+5, indexIsin+17);
		}
		return "";
	}
}
