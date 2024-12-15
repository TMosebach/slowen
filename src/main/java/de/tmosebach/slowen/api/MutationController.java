package de.tmosebach.slowen.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

import de.tmosebach.slowen.Utils;
import de.tmosebach.slowen.api.input.Buchung;
import de.tmosebach.slowen.api.input.Einlieferung;
import de.tmosebach.slowen.api.input.Ertrag;
import de.tmosebach.slowen.api.input.Kauf;
import de.tmosebach.slowen.api.input.Tilgung;
import de.tmosebach.slowen.api.input.Umsatz;
import de.tmosebach.slowen.api.input.Verkauf;
import de.tmosebach.slowen.domain.BuchungService;
import de.tmosebach.slowen.domain.EventService;
import de.tmosebach.slowen.domain.KontoService;
import de.tmosebach.slowen.domain.KontoUmsatz;
import de.tmosebach.slowen.values.BilanzPosition;
import de.tmosebach.slowen.values.KontoArt;
import de.tmosebach.slowen.values.Vorgang;

@Controller
public class MutationController {
	
	private static final Logger LOG = LoggerFactory.getLogger(MutationController.class);
	
	private KontoService kontoService;
	private BuchungService buchungService;
	private EventService eventService;

	public MutationController(KontoService kontoService, BuchungService buchungService, EventService eventService) {
		this.kontoService = kontoService;
		this.buchungService = buchungService;
		this.eventService = eventService;
	}

	@MutationMapping
	public String neuesKonto(@Argument de.tmosebach.slowen.api.input.KontoInput input) {

		// TODO Validierung
		
		de.tmosebach.slowen.domain.Konto konto = new de.tmosebach.slowen.domain.Konto();
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
		
		eventService.saveKontoanlage(konto);
		
		kontoService.neuesKonto(konto);
		
		return input.getName();
	}
	
	@MutationMapping
    public String buche(@Argument Buchung buchung) {

		// TODO Validierung
		
		String id = Utils.createId();
    	
		de.tmosebach.slowen.domain.Buchung result = new de.tmosebach.slowen.domain.Buchung();
		result.setVorgang(Vorgang.Buchung);
		result.setId(id);
		result.setDatum(buchung.getDatum());
		result.setEmpfaenger(buchung.getEmpfaenger());
		result.setVerwendung(buchung.getVerwendung());
		
		buchung.getUmsaetze().forEach( umsatz -> {
			result.addUmsatz(map(umsatz));
		});
		
		eventService.saveBuchung(result);
		
		buchungService.buche(result);

		return id;
    }
	
	private KontoUmsatz map(Umsatz umsatz) {
		KontoUmsatz kontoUmsatz = new KontoUmsatz();
		kontoUmsatz.setArt(KontoArt.Konto);
		kontoUmsatz.setKonto(umsatz.getKonto());
		kontoUmsatz.setValuta(umsatz.getValuta());
		kontoUmsatz.setBetrag(umsatz.getBetrag());
		return kontoUmsatz;
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
