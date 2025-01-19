package de.tmosebach.slowen.api;

import static de.tmosebach.slowen.Utils.notZero;
import static de.tmosebach.slowen.api.DomainMapper.toBuchung;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

import de.tmosebach.slowen.Utils;
import de.tmosebach.slowen.api.input.AssetInput;
import de.tmosebach.slowen.api.input.Buchung;
import de.tmosebach.slowen.api.input.Einlieferung;
import de.tmosebach.slowen.api.input.Ertrag;
import de.tmosebach.slowen.api.input.Kauf;
import de.tmosebach.slowen.api.input.Tilgung;
import de.tmosebach.slowen.api.input.Verkauf;
import de.tmosebach.slowen.domain.Asset;
import de.tmosebach.slowen.domain.AssetService;
import de.tmosebach.slowen.domain.BuchungService;
import de.tmosebach.slowen.domain.DepotBestand;
import de.tmosebach.slowen.domain.EventService;
import de.tmosebach.slowen.domain.KontoService;
import de.tmosebach.slowen.domain.KontoUmsatz;
import de.tmosebach.slowen.values.BilanzPosition;
import de.tmosebach.slowen.values.KontoArt;
import de.tmosebach.slowen.values.Vorgang;

@Controller
public class MutationController {
	
	private static final Logger LOG = LoggerFactory.getLogger(MutationController.class);
	
	private AssetService assetService;
	private KontoService kontoService;
	private BuchungService buchungService;
	private EventService eventService;
	private InputValidator inputValidator;

	public MutationController(
			AssetService assetService,
			KontoService kontoService,
			BuchungService buchungService,
			EventService eventService,
			InputValidator inputValidator) {
		this.assetService = assetService;
		this.kontoService = kontoService;
		this.buchungService = buchungService;
		this.eventService = eventService;
		this.inputValidator = inputValidator;
	}

	@MutationMapping
	public String neuesKonto(@Argument de.tmosebach.slowen.api.input.KontoInput input) {

		List<String> error = inputValidator.validate(input);
		if (! error.isEmpty()) {
			LOG.warn("Konto wird nicht importiert: {}", error);
			throw new IllegalArgumentException(error.toString());
		}
		
		de.tmosebach.slowen.domain.Konto konto = new de.tmosebach.slowen.domain.Konto();
		konto.setName(input.getName());
		
		KontoArt kontoArt = input.getArt();
		konto.setArt(kontoArt);
		if (kontoArt == KontoArt.Depot) {
			konto.setBilanzPosition(BilanzPosition.Aktiv);
		} else {
			konto.setBilanzPosition(input.getBilanzPosition());
			konto.setWaehrung(input.getWaehrung());
			
			if (kontoArt == KontoArt.Konto
					&& notZero(input.getSaldo())) {
				
				KontoUmsatz kontoUmsatz = new KontoUmsatz();
				kontoUmsatz.setArt(KontoArt.Konto);
				kontoUmsatz.setKonto(input.getName());
				kontoUmsatz.setValuta(input.getDatum());
				kontoUmsatz.setBetrag(input.getSaldo());
				
				de.tmosebach.slowen.domain.Buchung eroeffnung = new de.tmosebach.slowen.domain.Buchung();
				eroeffnung.setVorgang(Vorgang.Buchung);
				eroeffnung.setId(Utils.createId());
				eroeffnung.setDatum(input.getDatum());
				eroeffnung.setVerwendung("Eröffnungssaldo");
				eroeffnung.addUmsatz(kontoUmsatz);
				
				eventService.saveBuchung(eroeffnung);
				buchungService.buche(eroeffnung);
			}
		}

		LOG.info("neues Konto: {}", konto);
		
		eventService.saveKontoanlage(konto);
		
		kontoService.neuesKonto(konto);
		
		return input.getName();
	}
	
	@MutationMapping
    public String buche(@Argument Buchung buchung) {

		// TODO Validierung

		return verarbeiteBuchung(toBuchung(buchung));
    }

	private String verarbeiteBuchung(de.tmosebach.slowen.domain.Buchung buchung) {

		eventService.saveBuchung(buchung);
		
		buchungService.buche(buchung);

		return buchung.getId();
	}

	@MutationMapping
	public String neuesAsset(AssetInput input) {
		
		// TODO Validierung
		
		Asset asset = new Asset();
		asset.setName(input.getName());
		asset.setTyp(input.getTyp());
		asset.setIsin(input.getIsin());
		asset.setWpk(input.getWpk());
		
		eventService.saveAsset(asset);
		
		LOG.info("Neues Asset: {}", input);

		assetService.neuesAsset(asset);
    	
    	return input.getIsin();
	}
	
	@MutationMapping
    public String liefereEin(@Argument Einlieferung einlieferung) {

    	// TODO Validierung
		
		return verarbeiteBuchung(toBuchung(einlieferung));
    }

	@MutationMapping
    public String kaufe(@Argument Kauf kauf) {

    	LOG.info("kaufe: {}", kauf);
    	
    	// TODO Validierung
    	
		return verarbeiteBuchung(toBuchung(kauf));
    }

	@MutationMapping
    public String bucheErtrag(@Argument Ertrag ertrag) {

    	LOG.info("buche Ertrag: {}", ertrag);

    	// TODO validierung
    	
		return verarbeiteBuchung(toBuchung(ertrag));
    }
	
	@MutationMapping
    public String verkaufe(@Argument Verkauf verkauf) {

    	LOG.info("verkaufe: {}", verkauf);
    	
    	// TODO Validierung
    	
    	DepotBestand depotBestand = kontoService.findDepotBestandByName(verkauf.getDepot());
		
		return verarbeiteBuchung(toBuchung(verkauf, depotBestand));
    }

	
	@MutationMapping
    public String tilge(@Argument Tilgung tilgung) {

    	LOG.info("tilge: {}", tilgung);
    	
    	// TODO validierung
    	
    	DepotBestand depotBestand = kontoService.findDepotBestandByName(tilgung.getDepot());
		
		return verarbeiteBuchung(toBuchung(tilgung, depotBestand));
    }
}
