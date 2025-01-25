package de.tmosebach.slowen.backup;

import static org.apache.commons.lang3.StringUtils.trim;
import static org.apache.commons.lang3.StringUtils.isNotBlank;
import static de.tmosebach.slowen.DomainApiMapper.toApiKonto;
import static de.tmosebach.slowen.Utils.notZero;
import static de.tmosebach.slowen.DomainApiMapper.toApiAsset;
import static de.tmosebach.slowen.DomainApiMapper.toApiBuchung;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;

import de.tmosebach.slowen.Utils;
import de.tmosebach.slowen.api.DomainMapper;
import de.tmosebach.slowen.api.InputValidator;
import de.tmosebach.slowen.api.input.AssetInput;
import de.tmosebach.slowen.api.input.BuchungWrapper;
import de.tmosebach.slowen.api.input.KontoInput;
import de.tmosebach.slowen.api.input.Tilgung;
import de.tmosebach.slowen.api.input.Verkauf;
import de.tmosebach.slowen.domain.Asset;
import de.tmosebach.slowen.domain.AssetService;
import de.tmosebach.slowen.domain.Buchung;
import de.tmosebach.slowen.domain.BuchungService;
import de.tmosebach.slowen.domain.DepotBestand;
import de.tmosebach.slowen.domain.EventService;
import de.tmosebach.slowen.domain.Konto;
import de.tmosebach.slowen.domain.KontoService;
import de.tmosebach.slowen.domain.KontoUmsatz;
import de.tmosebach.slowen.preis.Preis;
import de.tmosebach.slowen.preis.PreisService;
import de.tmosebach.slowen.values.KontoArt;
import de.tmosebach.slowen.values.Vorgang;

@Service
public class ImExporter {
	
	private static final String CR = System.lineSeparator();
	
	private static final Logger LOG = LoggerFactory.getLogger(ImExporter.class);

	private ObjectMapper objectMapper;
	private KontoService kontoService;
	private AssetService assetService;
	private BuchungService buchungService;
	private EventService eventService;
	private InputValidator inputValidator;
	private PreisService preisService;

	public ImExporter(
			ObjectMapper objectMapper,
			KontoService kontoService,
			AssetService assetService,
			BuchungService buchungService,
			EventService eventService,
			InputValidator inputValidator,
			PreisService preisService) {
		this.objectMapper = objectMapper;
		this.kontoService = kontoService;
		this.assetService = assetService;
		this.buchungService = buchungService;
		this.eventService = eventService;
		this.inputValidator = inputValidator;
		this.preisService = preisService;
	}

	public void exportKonten(List<Konto> konten) {
		try {
			FileWriter writer = new FileWriter(new File("./ausgabe/konten.export"), Charset.defaultCharset());
			JsonGenerator generator = objectMapper.createGenerator(writer);
			
			AtomicInteger counter = new AtomicInteger();
			konten.stream()
				.map( konto -> toApiKonto(konto) )
				.forEach( konto -> {
					try {
						generator.writeObject(konto);
						counter.incrementAndGet();
						writer.write(CR);
					} catch (IOException e) {
						throw new RuntimeException(e);
					}
				});
			LOG.info("{} Konten exportiert.", counter.get());
		} catch (IOException e) {
			throw new ImExportException(e);
		}
	}
	
	public void exportAssets(List<Asset> assets) throws IOException {
		FileWriter writer = new FileWriter(new File("./ausgabe/assets.export"), Charset.defaultCharset());
		JsonGenerator generator = objectMapper.createGenerator(writer);
		
		AtomicInteger counter = new AtomicInteger();
		assets.stream()
			.map( asset -> toApiAsset(asset) )
			.forEach( asset -> {
				try {
					generator.writeObject(asset);
					counter.incrementAndGet();
					writer.write(CR);
				} catch (IOException e) {
					throw new RuntimeException(e);
				}
			});
		LOG.info("{} Assets exportiert.", counter.get());
	}

	public void exportBuchungen(List<Buchung> buchungen) throws IOException {
		FileWriter writer = new FileWriter(new File("./ausgabe/buchungen.export"), Charset.defaultCharset());
		JsonGenerator generator = objectMapper.createGenerator(writer);
		
		AtomicInteger counter = new AtomicInteger();
		buchungen.stream()
			.map( buchung -> toApiBuchung(buchung) )
			.forEach( buchung -> {
				try {
					generator.writeObject(buchung);
					counter.incrementAndGet();
					writer.write(CR);
				} catch (IOException e) {
					throw new RuntimeException(e);
				}
			});
		LOG.info("{} Buchungen exportiert.", counter.get());
	}

	public int importKonten(File file) {
		try {
			if (! file.exists()) {
				return 0;
			}
			
			List<String> lines = Files.readAllLines(file.toPath(), Charset.defaultCharset());
			
			AtomicInteger counter = new AtomicInteger();
			lines.forEach( line -> importKontoLine(counter, line) );
			
			return counter.get();
		} catch (IOException e) {
			throw new ImExportException(e);
		}
	}

	private void importKontoLine(AtomicInteger counter, String line) {
		try {
			String trimedLine = trim(line);
			if (isNotBlank(trimedLine)) {
				JsonParser parser = objectMapper.createParser(trimedLine);
				KontoInput kontoInput = parser.readValueAs(KontoInput.class);
				
				List<String> error = inputValidator.validate(kontoInput);
				if (! error.isEmpty()) {
					LOG.warn("Konto wird nicht importiert: {}", error);
					return;
				}
				
				Konto konto = DomainMapper.toKonto(kontoInput);
				
				counter.incrementAndGet();
				kontoService.neuesKonto(konto);
				eventService.saveKontoanlage(konto);
				
				if (KontoArt.Konto == kontoInput.getArt()
						&& notZero(kontoInput.getSaldo())) {
					
					KontoUmsatz kontoUmsatz = new KontoUmsatz();
					kontoUmsatz.setArt(KontoArt.Konto);
					kontoUmsatz.setKonto(kontoInput.getName());
					kontoUmsatz.setValuta(kontoInput.getDatum());
					kontoUmsatz.setBetrag(kontoInput.getSaldo());
					
					de.tmosebach.slowen.domain.Buchung eroeffnung = new de.tmosebach.slowen.domain.Buchung();
					eroeffnung.setVorgang(Vorgang.Buchung);
					eroeffnung.setId(Utils.createId());
					eroeffnung.setDatum(kontoInput.getDatum());
					eroeffnung.setVerwendung("Eröffnungssaldo");
					eroeffnung.addUmsatz(kontoUmsatz);
					
					eventService.saveBuchung(eroeffnung);
					buchungService.buche(eroeffnung);
				}
			}
		} catch (IOException e) {
			throw new ImExportException(e);
		}
	}

	public int importAssets(File file) {
		try {
			if (! file.exists()) {
				return 0;
			}
			
			List<String> lines = Files.readAllLines(file.toPath(), Charset.defaultCharset());

			AtomicInteger counter = new AtomicInteger();
			lines.forEach( line -> importAssetLine(counter, line) );
			return counter.get();
		} catch (IOException e) {
			throw new ImExportException(e);
		}
	}

	private void importAssetLine(AtomicInteger counter, String line) {
		try {
			String trimedLine = trim(line);
			if (isNotBlank(trimedLine)) {
				JsonParser parser = objectMapper.createParser(trimedLine);
				AssetInput assetInput = parser.readValueAs(AssetInput.class);
				
				List<String> error = inputValidator.validate(assetInput);
				if (! error.isEmpty()) {
					LOG.warn("Asset wird nicht importiert: {}", error);
					return;
				}
				
				Asset asset = DomainMapper.toAsset(assetInput);
				
				counter.incrementAndGet();
				assetService.neuesAsset(asset);
				eventService.saveAsset(asset);
			}
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	public int importBuchungen(File file) {
		try {
			List<String> lines = Files.readAllLines(file.toPath(), Charset.defaultCharset());
	
			AtomicInteger counter = new AtomicInteger();
			lines.forEach( line -> importBuchungLine(counter, line) );
			return counter.get();
		} catch (IOException e) {
			throw new ImExportException(e);
		}
	}

	private void importBuchungLine(AtomicInteger counter, String line) {
		try {
			String trimedLine = trim(line);
			if (isNotBlank(trimedLine)) {
				counter.incrementAndGet();
				switchVorgang(trimedLine);
			}
		} catch (IOException e) {
			throw new RuntimeException("In Zeile "+counter.get()+"\n"+line, e);
		}
	}

	private void switchVorgang(String line) throws IOException {
		JsonParser parser = objectMapper.createParser(line);
		BuchungWrapper buchungWrapper = parser.readValueAs(BuchungWrapper.class);

		Buchung buchung = null;
		DepotBestand depotBestand = null;
		switch (buchungWrapper.getVorgang()) {
		case Buchung: 
			buchung = DomainMapper.toBuchung(buchungWrapper.getBuchung());
			break;
		case Einlieferung: 
			buchung = DomainMapper.toBuchung(buchungWrapper.getEinlieferung());
			break;
		case Ertrag:
			buchung = DomainMapper.toBuchung(buchungWrapper.getErtrag());
			break;
		case Kauf:
			buchung = DomainMapper.toBuchung(buchungWrapper.getKauf());
			break;
		case Verkauf:
			Verkauf verkauf = buchungWrapper.getVerkauf();
			depotBestand = getDepotBestand(verkauf.getDepot());
			buchung = DomainMapper.toBuchung(verkauf, depotBestand);
			break;
		case Tilgung:
			Tilgung tilgung = buchungWrapper.getTilgung();
			depotBestand = getDepotBestand(tilgung.getDepot());
			buchung = DomainMapper.toBuchung(tilgung, depotBestand);
			break;
		default:
			throw new IllegalArgumentException("Unexpected value: " + buchungWrapper.getVorgang());
		}
		buchungService.buche(buchung);
		eventService.saveBuchung(buchung);
	}

	private DepotBestand getDepotBestand(String depotName) {
		return kontoService.findDepotBestandByName(depotName);
	}

	public int importPreise(File file) {
		try {
			if (! file.exists()) {
				return 0;
			}
			
			List<String> lines = Files.readAllLines(file.toPath(), Charset.defaultCharset());
			
			AtomicInteger counter = new AtomicInteger();
			lines.forEach( line -> importPreisLine(counter, line) );
			
			return counter.get();
		} catch (IOException e) {
			throw new ImExportException(e);
		}
	}

	private void importPreisLine(AtomicInteger counter, String line) {
		String trimedLine = trim(line);
		if (isNotBlank(trimedLine)) {
			String[] fields = trimedLine.split(";");
			Preis preis = new Preis();
			preis.setReferenz(fields[0]);
			preis.setDatum(LocalDate.parse(fields[1]));
			preis.setPreis(new BigDecimal(fields[2]));

			preisService.merge(preis);
		}
	}
}
