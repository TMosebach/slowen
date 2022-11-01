package de.tmosebach.slowen.input;

import static de.tmosebach.slowen.input.DateParser.parseDate;
import static java.util.Objects.nonNull;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.text.ParseException;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Stream;

import org.springframework.stereotype.Component;

import de.tmosebach.slowen.buchhaltung.Buchung;
import de.tmosebach.slowen.buchhaltung.BuchungService;
import de.tmosebach.slowen.buchhaltung.builder.BuchungBuilder;
import de.tmosebach.slowen.konten.Konto;
import de.tmosebach.slowen.konten.KontoService;
import de.tmosebach.slowen.shared.values.Betrag;
import de.tmosebach.slowen.shared.values.KontoIdentifier;

@Component
public class BuchungImport {
	
	private static final int COL_EMPFAENGER = 0;
	private static final int COL_VERWENDUNG = 1;
	private static final int COL_DATUM = 2;

	private DecimalFormat betragFormat;
	
	private KontoService kontoService;
	private BuchungService buchungService;

	public BuchungImport(
			KontoService kontoService,
			BuchungService buchungService) {
		this.kontoService = kontoService;
		this.buchungService = buchungService;
		
		betragFormat = 
				new DecimalFormat(
					"0.0", 
					DecimalFormatSymbols.getInstance(Locale.GERMANY));
		betragFormat.setParseBigDecimal(true);
	}

	private Mapper empfaenger = (builder, value) -> {
		if (nonNull(value) && !value.isBlank()) {
			builder.empfaenger(value);
		}
	};
	
	private Mapper verwendung = (builder, value) -> {
		if (nonNull(value) && !value.isBlank()) {
			builder.verwendung(value);
		}
	};
	
	public void doImport(Path path) {
		final NotFirstFilter notFirstFilter = new NotFirstFilter();
		try (Stream<String> stream = Files.lines(path)) {
			stream
				.filter( line -> notFirstFilter.notFirst(line) )
				.map( line -> line.split(";") )
				.map( spalten -> mapToBuchung(spalten) )
				.forEach( buchung -> buchungService.buche(buchung));
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	private Buchung mapToBuchung(String[] spalten) {
		LocalDate date = parseDate(spalten[COL_DATUM]);
		BuchungBuilder buchungBuilder = BuchungBuilder.buche(date);
		
		empfaenger.map(buchungBuilder, spalten[COL_EMPFAENGER]);
		verwendung.map(buchungBuilder, spalten[COL_VERWENDUNG]);
		
		final int laenge = spalten.length;
		int restLaenge = laenge - 3;
		
		if (restLaenge % 2 != 0) {
			throw new IllegalStateException("Inkonsistente Buchungen " + Arrays.asList(spalten));
		}
		
		while( restLaenge > 0) {
			int index = laenge - restLaenge;
			String kontoName = spalten[index];
			String betragString = spalten[index+1];
			
			Betrag betrag = null;
			try {
				betrag = new Betrag( (BigDecimal) betragFormat.parse(betragString));
			} catch (ParseException e) {
				throw new RuntimeException(e);
			}
			
			Optional<Konto> kontoOptional = kontoService.findByName(kontoName);
			KontoIdentifier kontoIdentifier = 
					kontoOptional
					.orElseThrow( () -> new RuntimeException("Unbekanntes Konto: "+kontoName))
					.getId();
			
			buchungBuilder.umsatz(kontoIdentifier, date, betrag);
			
			restLaenge -= 2;
		}
		
		return buchungBuilder.build();
	}
}
