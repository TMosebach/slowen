package de.tmosebach.slowen.api;

import static de.tmosebach.slowen.Utils.getBetragOder0;
import static de.tmosebach.slowen.Utils.notZero;
import static de.tmosebach.slowen.domain.Kontonamen.DIVIDENDE;
import static de.tmosebach.slowen.domain.Kontonamen.KEST;
import static de.tmosebach.slowen.domain.Kontonamen.KURSGEWINN;
import static de.tmosebach.slowen.domain.Kontonamen.KURSVERLUST;
import static de.tmosebach.slowen.domain.Kontonamen.PROVISION;
import static de.tmosebach.slowen.domain.Kontonamen.SOLI;
import static de.tmosebach.slowen.domain.Kontonamen.STUECKZINS;
import static de.tmosebach.slowen.domain.Kontonamen.ZINSKUPON;
import static java.math.BigDecimal.ZERO;
import static java.util.Objects.nonNull;

import java.math.BigDecimal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

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
import de.tmosebach.slowen.domain.EventService;
import de.tmosebach.slowen.domain.KontoService;
import de.tmosebach.slowen.values.BilanzPosition;
import de.tmosebach.slowen.values.KontoArt;

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

		BuchungBuilder builder = 
			BuchungBuilder
			.newBuchung(
				buchung.getDatum(),
				buchung.getEmpfaenger(),
				buchung.getVerwendung());

		buchung.getUmsaetze().forEach( umsatz -> 
			builder.addKontoUmsatz(
				umsatz.getKonto(),
				umsatz.getValuta(),
				umsatz.getBetrag())
		);
		
		return verarbeiteBuchung(builder);
    }

	private String verarbeiteBuchung(BuchungBuilder builder) {
		de.tmosebach.slowen.domain.Buchung result =
				builder.getBuchung();
		
		eventService.saveBuchung(result);
		
		buchungService.buche(result);

		return result.getId();
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

		BuchungBuilder builder = 
			BuchungBuilder.newEinlieferung(
				einlieferung.getDatum(),
				einlieferung.getAsset()
					+" "+einlieferung.getMenge()
					+ (nonNull(einlieferung.getBetrag())
							?" zu "+einlieferung.getBetrag()
							:""));
		
		builder.addDepotUmsatz(
				einlieferung.getDepot(),
				einlieferung.getAsset(),
				einlieferung.getBetrag(),
				einlieferung.getValuta(),
				einlieferung.getMenge());
		
		return verarbeiteBuchung(builder);
    }

	@MutationMapping
    public String kaufe(@Argument Kauf kauf) {

    	LOG.info("kaufe: {}", kauf);
    	
    	// TODO Validierung
    	
    	BuchungBuilder builder = 
			BuchungBuilder
			.newKauf(
				kauf.getDatum(),
				kauf.getAsset()+" "+kauf.getMenge()
				+ " zu "+ kauf.getBetrag());
		
		BigDecimal einstandswert = kauf.getBetrag();
		BigDecimal stueckzins = getBetragOder0(kauf.getStueckzins());
		BigDecimal provision = getBetragOder0(kauf.getProvision());
		
		BigDecimal belastung = 
				einstandswert.add(provision).add(stueckzins).negate();
		
		builder.addDepotUmsatz(
			kauf.getDepot(),
			kauf.getAsset(),
			einstandswert,
			kauf.getValuta(),
			kauf.getMenge());
		
		builder.addKontoUmsatz(kauf.getKonto(), kauf.getValuta(), belastung);
		
		if (notZero(provision)) {
			builder.addKontoUmsatz(PROVISION, kauf.getValuta(), provision);
		}
		
		if (notZero(stueckzins)) {
			builder.addKontoUmsatz(STUECKZINS, kauf.getValuta(), stueckzins);
		}
		
		return verarbeiteBuchung(builder);
    }

	@MutationMapping
    public String bucheErtrag(@Argument Ertrag ertrag) {

    	LOG.info("buche Ertrag: {}", ertrag);

    	// TODO validierung
    	
    	
		BuchungBuilder builder = 
			BuchungBuilder
			.newErtrag(
				ertrag.getDatum(),
				"Ertrag zu "+ertrag.getAsset());
		
		BigDecimal bruttowert = ertrag.getBetrag();
		BigDecimal kest = getBetragOder0(ertrag.getKest());
		BigDecimal soli = getBetragOder0(ertrag.getSoli());
		
		BigDecimal gutschrift = 
				bruttowert
				.subtract(soli)
				.subtract(kest);
		
		builder.addDepotUmsatz(
				ertrag.getDepot(),
				ertrag.getAsset(),
				ZERO,
				ertrag.getValuta(),
				ZERO);

		if (ertrag.getErtragsart() == Ertragsart.Dividende) {
			builder.addKontoUmsatz(DIVIDENDE, ertrag.getValuta(), bruttowert.negate());
		} else {
			builder.addKontoUmsatz(ZINSKUPON, ertrag.getValuta(), bruttowert.negate());
		}
		builder.addKontoUmsatz(ertrag.getKonto(), ertrag.getValuta(), gutschrift);

		if (notZero(kest)) {
			builder.addKontoUmsatz(KEST, ertrag.getValuta(), kest);
		}
		
		if (notZero(soli)) {
			builder.addKontoUmsatz(SOLI, ertrag.getValuta(), soli);
		}
		
		return verarbeiteBuchung(builder);
    }
	
	@MutationMapping
    public String verkaufe(@Argument Verkauf verkauf) {

    	LOG.info("verkaufe: {}", verkauf);
    	
    	// TODO Validierung
    	
    	BuchungBuilder builder = 
    			BuchungBuilder
    			.newVerkauf(
    				verkauf.getDatum(),
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
			builder.addKontoUmsatz(KURSVERLUST, verkauf.getValuta(), guv);
		} else if (guv.compareTo(BigDecimal.ZERO) < 0){
			builder.addKontoUmsatz(KURSGEWINN, verkauf.getValuta(), guv);
		}
		
		builder.addDepotUmsatz(
				verkauf.getDepot(),
				verkauf.getAsset(),
				wertabgang,
				verkauf.getValuta(),
				bestandsaenderung);

		builder.addKontoUmsatz(verkauf.getKonto(), verkauf.getValuta(), gutschrift);
		
		if (notZero(provision)) {
			builder.addKontoUmsatz(PROVISION, verkauf.getValuta(), provision);
		}
		
		if (notZero(kest)) {
			builder.addKontoUmsatz(KEST, verkauf.getValuta(), kest);
		}
		
		if (notZero(soli)) {
			builder.addKontoUmsatz(SOLI, verkauf.getValuta(), soli);
		}
		
		return verarbeiteBuchung(builder);
    }

	
	@MutationMapping
    public String tilge(@Argument Tilgung tilgung) {

    	LOG.info("tilge: {}", tilgung);
    	
    	// TODO validierung
    	
    	BuchungBuilder builder = 
			BuchungBuilder
			.newTilgung(
				tilgung.getDatum(),
				tilgung.getAsset()+" "+tilgung.getMenge());
		
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
			builder.addKontoUmsatz(KURSVERLUST, tilgung.getValuta(), guv);
		} else if (guv.compareTo(BigDecimal.ZERO) < 0){
			builder.addKontoUmsatz(KURSGEWINN, tilgung.getValuta(), guv);
		}
		
		builder.addDepotUmsatz(
				tilgung.getDepot(),
				tilgung.getAsset(),
				wertabgang,
				tilgung.getValuta(),
				bestandsaenderung);

		builder.addKontoUmsatz(tilgung.getKonto(), tilgung.getValuta(), gutschrift);

		if (notZero(kest)) {
			builder.addKontoUmsatz(KEST, tilgung.getValuta(), kest);
		}
		
		if (notZero(soli)) {
			builder.addKontoUmsatz(SOLI, tilgung.getValuta(), soli);
		}
		
		return verarbeiteBuchung(builder);
    }
}
