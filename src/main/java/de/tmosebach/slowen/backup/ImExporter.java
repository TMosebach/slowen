package de.tmosebach.slowen.backup;

import static org.apache.commons.lang3.StringUtils.trim;
import static org.apache.commons.lang3.StringUtils.isNotBlank;
import static de.tmosebach.slowen.DomainApiMapper.toApiKonto;
import static de.tmosebach.slowen.DomainApiMapper.toApiAsset;
import static de.tmosebach.slowen.DomainApiMapper.toApiBuchung;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;

import de.tmosebach.slowen.api.DomainMapper;
import de.tmosebach.slowen.api.input.AssetInput;
import de.tmosebach.slowen.api.input.BuchungWrapper;
import de.tmosebach.slowen.domain.Asset;
import de.tmosebach.slowen.domain.AssetService;
import de.tmosebach.slowen.domain.Buchung;
import de.tmosebach.slowen.domain.BuchungService;
import de.tmosebach.slowen.domain.Konto;
import de.tmosebach.slowen.domain.KontoService;

@Service
public class ImExporter {
	
	private static final String CR = System.lineSeparator();
	
	private static final Logger LOG = LoggerFactory.getLogger(ImExporter.class);

	private ObjectMapper objectMapper;
	private KontoService kontoService;
	private AssetService assetService;
	private BuchungService buchungService;

	public ImExporter(
			ObjectMapper objectMapper,
			KontoService kontoService,
			AssetService assetService,
			BuchungService buchungService) {
		this.objectMapper = objectMapper;
		this.kontoService = kontoService;
		this.assetService = assetService;
		this.buchungService = buchungService;
	}

	public void exportKonten(List<Konto> konten) throws IOException {
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

	public int importKonten(File file) throws IOException {
		List<String> lines = Files.readAllLines(file.toPath(), Charset.defaultCharset());
		
		AtomicInteger counter = new AtomicInteger();
		lines.forEach( line -> {
			try {
				String trimedLine = trim(line);
				if (isNotBlank(trim(trimedLine))) {
					JsonParser parser = objectMapper.createParser(trimedLine);
					Konto konto = parser.readValueAs(Konto.class);
					counter.incrementAndGet();
					
					kontoService.neuesKonto(konto);
				}
			} catch (IOException e) {
				throw new RuntimeException(e);
			}
		});
		return counter.get();
	}

	public int importAssets(File file) throws IOException {
		List<String> lines = Files.readAllLines(file.toPath(), Charset.defaultCharset());
		
		
		AtomicInteger counter = new AtomicInteger();
		lines.forEach( line -> {
			try {
				String trimedLine = trim(line);
				if (isNotBlank(trim(trimedLine))) {
					JsonParser parser = objectMapper.createParser(trimedLine);
					AssetInput input = parser.readValueAs(AssetInput.class);
					counter.incrementAndGet();
					
					Asset asset = new Asset();
					asset.setName(input.getName());
					asset.setTyp(input.getTyp());
					asset.setIsin(input.getIsin());
					asset.setWpk(input.getWpk());
					
					assetService.neuesAsset(asset);
				}
			} catch (IOException e) {
				throw new RuntimeException(e);
			}
		});
		return counter.get();
	}

	public int importBuchungen(File file) throws IOException {
		List<String> lines = Files.readAllLines(file.toPath(), Charset.defaultCharset());

		AtomicInteger counter = new AtomicInteger();
		lines.forEach( line -> {
			try {
				String trimedLine = trim(line);
				if (isNotBlank(trim(trimedLine))) {
					switchVorgang(trimedLine);
					counter.incrementAndGet();
				}
			} catch (IOException e) {
				throw new RuntimeException(e);
			}
		});
		return counter.get();
	}

	private void switchVorgang(String trimedLine) throws IOException {
		int start = trimedLine.indexOf("vorgang\":");
		String vorgang = trimedLine.substring(start+10, start+14);
		switch (vorgang) {
		case "Buch": 
			importBuchung(trimedLine);
			break;
		default:
			throw new IllegalArgumentException("Unexpected value: " + vorgang);
		}
	}

	private void importBuchung(String line) throws IOException {
		JsonParser parser = objectMapper.createParser(line);
		BuchungWrapper buchungWrapper = parser.readValueAs(BuchungWrapper.class);
		
		buchungService.buche(
			DomainMapper.toBuchung(
				buchungWrapper.getBuchung()));
	}
}
