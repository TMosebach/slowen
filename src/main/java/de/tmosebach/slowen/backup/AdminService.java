package de.tmosebach.slowen.backup;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import de.tmosebach.slowen.domain.EventService;

@Service
public class AdminService {

	private static final Logger LOG = LoggerFactory.getLogger(AdminService.class);
	
	private EventService eventService;
	private ImExporter imExporter;

	public AdminService(EventService eventService, ImExporter imExporter) {
		this.eventService = eventService;
		this.imExporter = imExporter;
	}

	public String exportDb() {
		
		LOG.info("Starte Export.");
		
		try {
			imExporter.exportKonten(eventService.getKonten());
			imExporter.exportAssets(eventService.getAssets());
			imExporter.exportBuchungen(eventService.getBuchungen());
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
		
		LOG.info("Export abgeschlossen.");
		
		return "Exportiert um "+LocalDateTime.now().toLocalTime();
	}

	public String importDb() {

		int kontoCount = imExporter.importKonten(new File("eingabe/konten.import"));
		int assetCount = imExporter.importAssets(new File("eingabe/assets.import"));

		File[] files = findFiles("buchungen");
		int buchungCount = 0;
		buchungCount += importFile(files, file -> imExporter.importBuchungen(file) );
			
		int preisCount = 0;
		files = findFiles("preise");
		for (int i = 0; i < files.length; i++) {
			preisCount += imExporter.importPreise(files[i]);
		}
		
		return new StringBuilder("Zusammen ")
				.append(kontoCount).append(" Konten, ")
				.append(assetCount).append(" Assets, ")
				.append(buchungCount).append(" Buchungen und ")
				.append(preisCount).append(" Preise importiert.")
				.toString();
	}

	private int importFile(File[] files, Function<File, Integer> importStatement) {
		int count = 0;
		for (int i = 0; i < files.length; i++) {
			count += importStatement.apply(files[i]);
		}
		return count;
	}

	private File[] findFiles(String namensanfang) {
		File[] files = 
				new File("eingabe")
				.listFiles(file -> file.getName().startsWith(namensanfang));
		Arrays.sort(files);
		return files;
	}
}
