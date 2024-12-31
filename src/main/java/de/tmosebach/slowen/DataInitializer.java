package de.tmosebach.slowen;

import java.util.concurrent.atomic.AtomicInteger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import de.tmosebach.slowen.domain.AssetService;
import de.tmosebach.slowen.domain.BuchungService;
import de.tmosebach.slowen.domain.EventService;
import de.tmosebach.slowen.domain.KontoService;

@Component
@Primary
public class DataInitializer implements CommandLineRunner {
	
	private static final Logger LOG = LoggerFactory.getLogger(DataInitializer.class);

	private EventService eventService;
	private KontoService kontoService;
	private AssetService assetService;
	private BuchungService buchungService;
	
	public DataInitializer(
			EventService eventService, 
			KontoService kontoService, 
			AssetService assetService,
			BuchungService buchungService) {
		this.eventService = eventService;
		this.kontoService = kontoService;
		this.assetService = assetService;
		this.buchungService = buchungService;
	}

	@Override
	public void run(String... args) throws Exception {
		LOG.info("Initialisiere Daten...");
		
		loadKonten();
		loadAssets();
		loadBuchungen();
		
		LOG.info("Initialisierung abgeschlossen.");
	}

	private void loadBuchungen() {
		LOG.info("... lade Buchungen ...");
		
		AtomicInteger count = new AtomicInteger();
		eventService.getBuchungen().forEach( buchung -> {
			buchungService.buche(buchung);
			count.incrementAndGet();
		});
		
		LOG.info("... {} geladen ...", count.get());
	}

	private void loadAssets() {
		LOG.info("... lade Assets ...");
		
		AtomicInteger count = new AtomicInteger();
		eventService.getAssets().forEach( asset -> {
			assetService.neuesAsset(asset);
			count.incrementAndGet();
		});
		
		LOG.info("... {} geladen ...", count.get());
	}

	private void loadKonten() {
		LOG.info("... lade Konten ...");
		
		AtomicInteger count = new AtomicInteger();
		eventService.getKonten().forEach( konto -> {
			kontoService.neuesKonto(konto);
			count.incrementAndGet();
		});
		
		LOG.info("... {} geladen ...", count.get());
	}

}
