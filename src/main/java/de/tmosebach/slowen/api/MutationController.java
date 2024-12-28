package de.tmosebach.slowen.api;

import static java.math.BigDecimal.ZERO;
import static de.tmosebach.slowen.Utils.getBetragOder0;
import static de.tmosebach.slowen.Utils.notZero;
import static de.tmosebach.slowen.domain.DomainFunctions.createKontoUmsatz;
import static de.tmosebach.slowen.domain.Kontonamen.*;
import static de.tmosebach.slowen.domain.Kontonamen.KURSGEWINN;
import static de.tmosebach.slowen.domain.Kontonamen.KURSVERLUST;
import static de.tmosebach.slowen.domain.Kontonamen.PROVISION;
import static de.tmosebach.slowen.domain.Kontonamen.SOLI;
import static de.tmosebach.slowen.domain.Kontonamen.STUECKZINS;
import static java.util.Objects.nonNull;

import java.math.BigDecimal;

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
import de.tmosebach.slowen.api.input.Ertragsart;
import de.tmosebach.slowen.api.input.Kauf;
import de.tmosebach.slowen.api.input.Tilgung;
import de.tmosebach.slowen.api.input.Verkauf;
import de.tmosebach.slowen.domain.Asset;
import de.tmosebach.slowen.domain.AssetService;
import de.tmosebach.slowen.domain.Bestand;
import de.tmosebach.slowen.domain.BuchungService;
import de.tmosebach.slowen.domain.DepotBestand;
import de.tmosebach.slowen.domain.DepotUmsatz;
import de.tmosebach.slowen.domain.EventService;
import de.tmosebach.slowen.domain.KontoService;
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

	public MutationController(
			AssetService assetService,
			KontoService kontoService,
			BuchungService buchungService,
			EventService eventService) {
		this.assetService = assetService;
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
			result.addUmsatz(
				createKontoUmsatz(
					umsatz.getKonto(), umsatz.getValuta(), umsatz.getBetrag()));
		});
		
		eventService.saveBuchung(result);
		
		buchungService.buche(result);

		return id;
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
		
		String id = Utils.createId();
    	
		de.tmosebach.slowen.domain.Buchung buchung = new de.tmosebach.slowen.domain.Buchung();
		buchung.setVorgang(Vorgang.Einlieferung);
		buchung.setId(id);
		buchung.setDatum(einlieferung.getDatum());
		buchung.setVerwendung(
				einlieferung.getAsset()+" "+einlieferung.getMenge()
				+ (nonNull(einlieferung.getBetrag())
						?" zu "+einlieferung.getBetrag()
						:""));
		
		DepotUmsatz umsatz = new DepotUmsatz();
		umsatz.setArt(KontoArt.Depot);
		umsatz.setKonto(einlieferung.getDepot());
		umsatz.setAsset(einlieferung.getAsset());
		umsatz.setBetrag(einlieferung.getBetrag());
		umsatz.setValuta(einlieferung.getValuta());
		umsatz.setMenge(einlieferung.getMenge());
		buchung.addUmsatz(umsatz);
		
		eventService.saveBuchung(buchung);
    	
    	LOG.info("Einlieferung: {}", einlieferung);
    	
    	buchungService.buche(buchung);
    	
    	return id;
    }

	@MutationMapping
    public String kaufe(@Argument Kauf kauf) {

    	LOG.info("kaufe: {}", kauf);
    	
    	// TODO Validierung
    	
    	String id = Utils.createId();
    	
    	de.tmosebach.slowen.domain.Buchung buchung = new de.tmosebach.slowen.domain.Buchung();
		buchung.setVorgang(Vorgang.Kauf);
		buchung.setId(id);
		buchung.setDatum(kauf.getDatum());
		buchung.setVerwendung(
				kauf.getAsset()+" "+kauf.getMenge()
				+ " zu "+ kauf.getBetrag());
		
		BigDecimal einstandswert = kauf.getBetrag();
		BigDecimal stueckzins = getBetragOder0(kauf.getStueckzins());
		BigDecimal provision = getBetragOder0(kauf.getProvision());
		
		BigDecimal belastung = 
				einstandswert.add(provision).add(stueckzins).negate();
		
		DepotUmsatz depotUmsatz = new DepotUmsatz();
		depotUmsatz.setArt(KontoArt.Depot);
		depotUmsatz.setKonto(kauf.getDepot());
		depotUmsatz.setAsset(kauf.getAsset());
		depotUmsatz.setBetrag(einstandswert);
		depotUmsatz.setValuta(kauf.getValuta());
		depotUmsatz.setMenge(kauf.getMenge());
		buchung.addUmsatz(depotUmsatz);

		buchung.addUmsatz(createKontoUmsatz(kauf.getKonto(), kauf.getValuta(), belastung));
		
		if (notZero(provision)) {
			buchung.addUmsatz(createKontoUmsatz(PROVISION, kauf.getValuta(), provision));
		}
		
		if (notZero(stueckzins)) {
			buchung.addUmsatz(createKontoUmsatz(STUECKZINS, kauf.getValuta(), stueckzins));
		}
		
		eventService.saveBuchung(buchung);
		
		buchungService.buche(buchung);
 	
    	return id;
    }

	@MutationMapping
    public String bucheErtrag(@Argument Ertrag ertrag) {

    	LOG.info("buche Ertrag: {}", ertrag);

    	// TODO validierung
    	
    	String id = Utils.createId();
    	
    	de.tmosebach.slowen.domain.Buchung buchung = new de.tmosebach.slowen.domain.Buchung();
		buchung.setVorgang(Vorgang.Ertrag);
		buchung.setId(id);
		buchung.setDatum(ertrag.getDatum());
		buchung.setVerwendung("Ertrag zu "+ertrag.getAsset());
		
		BigDecimal bruttowert = ertrag.getBetrag();
		BigDecimal kest = getBetragOder0(ertrag.getKest());
		BigDecimal soli = getBetragOder0(ertrag.getSoli());
		
		BigDecimal gutschrift = 
				bruttowert
				.subtract(soli)
				.subtract(kest);
		
		DepotUmsatz depotUmsatz = new DepotUmsatz();
		depotUmsatz.setArt(KontoArt.Depot);
		depotUmsatz.setKonto(ertrag.getDepot());
		depotUmsatz.setAsset(ertrag.getAsset());
		depotUmsatz.setBetrag(ZERO);
		depotUmsatz.setValuta(ertrag.getValuta());
		depotUmsatz.setMenge(ZERO);
		buchung.addUmsatz(depotUmsatz);

		if (ertrag.getErtragsart() == Ertragsart.Dividende) {
			buchung.addUmsatz(createKontoUmsatz(DIVIDENDE, ertrag.getValuta(), bruttowert.negate()));
		} else {
			buchung.addUmsatz(createKontoUmsatz(ZINSKUPON, ertrag.getValuta(), bruttowert.negate()));
		}
		buchung.addUmsatz(createKontoUmsatz(ertrag.getKonto(), ertrag.getValuta(), gutschrift));

		if (notZero(kest)) {
			buchung.addUmsatz(createKontoUmsatz(KEST, ertrag.getValuta(), kest));
		}
		
		if (notZero(soli)) {
			buchung.addUmsatz(createKontoUmsatz(SOLI, ertrag.getValuta(), soli));
		}
		
		eventService.saveBuchung(buchung);
		
		buchungService.buche(buchung);

    	return id;
    }
	
	@MutationMapping
    public String verkaufe(@Argument Verkauf verkauf) {

    	LOG.info("verkaufe: {}", verkauf);
    	
    	// TODO Validierung
    	
    	String id = Utils.createId();
    	
    	de.tmosebach.slowen.domain.Buchung buchung = new de.tmosebach.slowen.domain.Buchung();
		buchung.setVorgang(Vorgang.Verkauf);
		buchung.setId(id);
		buchung.setDatum(verkauf.getDatum());
		buchung.setVerwendung(
				verkauf.getAsset()+" "+verkauf.getMenge()
				+ " zu "+ verkauf.getBetrag());
		
		BigDecimal kurswert = verkauf.getBetrag();
		BigDecimal provision = getBetragOder0(verkauf.getProvision());
		BigDecimal kest = getBetragOder0(verkauf.getKest());
		BigDecimal soli = getBetragOder0(verkauf.getSoli());
		
		BigDecimal gutschrift = 
			kurswert
				.subtract(provision)
				.subtract(soli)
				.subtract(kest);
		
		DepotBestand depotBestand = kontoService.findDepotBestandByName(verkauf.getDepot());
		Bestand bestand = depotBestand.getBestandZu(verkauf.getAsset()).orElseThrow();
		BigDecimal ausgangsbestand = bestand.getMenge();
		BigDecimal bestandsaenderung = verkauf.getMenge().negate();
		
		BigDecimal verkaufQuote = bestandsaenderung.divide(ausgangsbestand);
		BigDecimal wertabgang = bestand.getEinstand().multiply( verkaufQuote );
		BigDecimal guv = 
				gutschrift.add(wertabgang)
				.negate(); // Buchungswert ermitteln
		
		// Falls es GuV gab
		if (guv.compareTo(BigDecimal.ZERO) > 0) {
			buchung.addUmsatz(createKontoUmsatz(KURSVERLUST, verkauf.getValuta(), guv));
		} else if (guv.compareTo(BigDecimal.ZERO) < 0){
			buchung.addUmsatz(createKontoUmsatz(KURSGEWINN, verkauf.getValuta(), guv));
		}
		
		DepotUmsatz depotUmsatz = new DepotUmsatz();
		depotUmsatz.setArt(KontoArt.Depot);
		depotUmsatz.setKonto(verkauf.getDepot());
		depotUmsatz.setAsset(verkauf.getAsset());
		depotUmsatz.setBetrag(wertabgang);
		depotUmsatz.setValuta(verkauf.getValuta());
		depotUmsatz.setMenge(bestandsaenderung);
		buchung.addUmsatz(depotUmsatz);

		buchung.addUmsatz(createKontoUmsatz(verkauf.getKonto(), verkauf.getValuta(), gutschrift));
		
		if (notZero(provision)) {
			buchung.addUmsatz(createKontoUmsatz(PROVISION, verkauf.getValuta(), provision));
		}
		
		if (notZero(kest)) {
			buchung.addUmsatz(createKontoUmsatz(KEST, verkauf.getValuta(), kest));
		}
		
		if (notZero(soli)) {
			buchung.addUmsatz(createKontoUmsatz(SOLI, verkauf.getValuta(), soli));
		}
		
		eventService.saveBuchung(buchung);
		
		buchungService.buche(buchung);

    	return id;
    }

	
	@MutationMapping
    public String tilge(@Argument Tilgung tilgung) {

    	LOG.info("tilge: {}", tilgung);
    	
    	// TODO validierung
    	
    	String id = Utils.createId();
    	
    	de.tmosebach.slowen.domain.Buchung buchung = new de.tmosebach.slowen.domain.Buchung();
		buchung.setVorgang(Vorgang.Tilgung);
		buchung.setId(id);
		buchung.setDatum(tilgung.getDatum());
		buchung.setVerwendung(tilgung.getAsset()+" "+tilgung.getMenge());
		
		BigDecimal kurswert = tilgung.getBetrag();
		BigDecimal kest = getBetragOder0(tilgung.getKest());
		BigDecimal soli = getBetragOder0(tilgung.getSoli());
		
		BigDecimal gutschrift = 
			kurswert
				.subtract(soli)
				.subtract(kest);
		
		DepotBestand depotBestand = kontoService.findDepotBestandByName(tilgung.getDepot());
		Bestand bestand = depotBestand.getBestandZu(tilgung.getAsset()).orElseThrow();
		BigDecimal ausgangsbestand = bestand.getMenge();
		BigDecimal bestandsaenderung = tilgung.getMenge().negate();
		
		BigDecimal verkaufQuote = bestandsaenderung.divide(ausgangsbestand);
		BigDecimal wertabgang = bestand.getEinstand().multiply( verkaufQuote );
		BigDecimal guv = 
				gutschrift.add(wertabgang)
				.negate(); // Buchungswert ermitteln
		
		// Falls es GuV gab
		if (guv.compareTo(BigDecimal.ZERO) > 0) {
			buchung.addUmsatz(createKontoUmsatz(KURSVERLUST, tilgung.getValuta(), guv));
		} else if (guv.compareTo(BigDecimal.ZERO) < 0){
			buchung.addUmsatz(createKontoUmsatz(KURSGEWINN, tilgung.getValuta(), guv));
		}
		
		DepotUmsatz depotUmsatz = new DepotUmsatz();
		depotUmsatz.setArt(KontoArt.Depot);
		depotUmsatz.setKonto(tilgung.getDepot());
		depotUmsatz.setAsset(tilgung.getAsset());
		depotUmsatz.setBetrag(wertabgang);
		depotUmsatz.setValuta(tilgung.getValuta());
		depotUmsatz.setMenge(bestandsaenderung);
		buchung.addUmsatz(depotUmsatz);

		buchung.addUmsatz(createKontoUmsatz(tilgung.getKonto(), tilgung.getValuta(), gutschrift));

		if (notZero(kest)) {
			buchung.addUmsatz(createKontoUmsatz(KEST, tilgung.getValuta(), kest));
		}
		
		if (notZero(soli)) {
			buchung.addUmsatz(createKontoUmsatz(SOLI, tilgung.getValuta(), soli));
		}
		
		eventService.saveBuchung(buchung);
		
		buchungService.buche(buchung);
		
		return id;
    }
}
