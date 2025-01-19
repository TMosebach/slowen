package de.tmosebach.slowen.backup;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;

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
		int kontoCount;
		int assetCount;
		int buchungCount;
		try {
			kontoCount = imExporter.importKonten(new File("eingabe/konten.import"));
			assetCount = imExporter.importAssets(new File("eingabe/assets.import"));

			File[] files = 
					new File("eingabe")
					.listFiles(file -> file.getName().startsWith("buchungen"));
			Arrays.sort(files);
			
			buchungCount = 0;
			for (int i = 0; i < files.length; i++) {
				buchungCount += imExporter.importBuchungen(files[i]);
			}
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
		
		return new StringBuilder("Zusammen ")
				.append(kontoCount).append(" Konten, ")
				.append(assetCount).append(" Assets und ")
				.append(buchungCount).append(" Buchungen importiert.")
				.toString();
	}
}
