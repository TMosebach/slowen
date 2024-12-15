package de.tmosebach.slowen.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

import de.tmosebach.slowen.EventRepository;
import de.tmosebach.slowen.api.input.Buchung;
import de.tmosebach.slowen.api.input.Einlieferung;
import de.tmosebach.slowen.api.input.Ertrag;
import de.tmosebach.slowen.api.input.Kauf;
import de.tmosebach.slowen.api.input.Tilgung;
import de.tmosebach.slowen.api.input.Verkauf;
import de.tmosebach.slowen.api.types.Konto;
import de.tmosebach.slowen.domain.KontoService;
import de.tmosebach.slowen.values.BilanzPosition;
import de.tmosebach.slowen.values.KontoArt;

@Controller
public class MutationController {
	
	private static final Logger LOG = LoggerFactory.getLogger(MutationController.class);
	
	private KontoService kontoService;
	private EventRepository repository;
	
	public MutationController(KontoService kontoService, EventRepository repository) {
		this.kontoService = kontoService;
		this.repository = repository;
	}

	@MutationMapping
	public String neuesKonto(@Argument de.tmosebach.slowen.api.input.KontoInput input) {

		// TODO Validierung
		
		Konto konto = new Konto();
		konto.setName(input.getName());
		
		KontoArt kontoArt = input.getArt();
		konto.setArt(kontoArt);
		if (kontoArt == KontoArt.Depot) {
			konto.setBilanzPosition(BilanzPosition.Aktiv);
		} else {
			konto.setBilanzPosition(input.getBilanzPosition());
			konto.setWaehrung(input.getWaehrung());
			
			// TODO ggf. Eröffnungssaldo einrichtten
		}

		LOG.info("neues Konto: {}", konto);
		
		repository.saveKontoanlage(konto);
		
		kontoService.neuesKonto(konto);
		
		return null;
	}
	
	@MutationMapping
    public String buche(@Argument Buchung buchung) {

		// TODO Validierung
    	
		return null;
    }
	
	@MutationMapping
    public String liefereEin(@Argument Einlieferung einlieferung) {

    	LOG.info("Einlieferung: {}", einlieferung);

    	// TODO Validierung
    	
    	return null;
    }

	@MutationMapping
    public String kaufe(@Argument Kauf kauf) {

    	LOG.info("kaufe: {}", kauf);
    	
    	// TODO Validierung
 	
    	return null;
    }

	@MutationMapping
    public String bucheErtrag(@Argument Ertrag ertrag) {

    	LOG.info("buche Ertrag: {}", ertrag);

    	// TODO validierung
    	
    	return null;
    }
	
	@MutationMapping
    public String verkaufe(@Argument Verkauf verkauf) {

    	LOG.info("verkaufe: {}", verkauf);
    	
    	// TODO validierung
    	
    	return null;
    }
	
	@MutationMapping
    public String tilge(@Argument Tilgung tilgung) {

    	LOG.info("tilge: {}", tilgung);
    	
    	// TODO validierung
    	
    	return null;
    }
}
