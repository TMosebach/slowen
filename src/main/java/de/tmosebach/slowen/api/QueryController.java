package de.tmosebach.slowen.api;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import de.tmosebach.slowen.api.types.Asset;
import de.tmosebach.slowen.api.types.Bestand;
import de.tmosebach.slowen.api.types.Konto;
import de.tmosebach.slowen.api.types.Vermoegen;
import de.tmosebach.slowen.domain.AssetService;
import de.tmosebach.slowen.domain.DepotBestand;
import de.tmosebach.slowen.domain.KontoBestand;
import de.tmosebach.slowen.domain.KontoService;
import de.tmosebach.slowen.preis.Preis;
import de.tmosebach.slowen.preis.PreisService;
import de.tmosebach.slowen.values.BilanzPosition;
import de.tmosebach.slowen.values.KontoArt;

@Controller
public class QueryController {
	
	private KontoService kontoService;
	private AssetService assetService;
	private PreisService preisService;
	
	public QueryController(
		KontoService kontoService,
		AssetService assetService,
		PreisService preisService) {
		this.kontoService = kontoService;
		this.assetService = assetService;
		this.preisService = preisService;
	}

	@QueryMapping
	public List<Asset> assets() {
		return assetService.getAssets().stream()
				.map( domainAsset -> {
					Asset asset = new Asset();
					asset.setIsin(domainAsset.getIsin());
					asset.setTyp(domainAsset.getTyp());
					asset.setName(domainAsset.getName());
					asset.setWpk(domainAsset.getWpk());
					return asset;
				}).toList();
	}
	
	@QueryMapping
	public List<String> buchungen(String konto) {
		return List.of();
	}

	@QueryMapping
	public Konto findKontoByName(@Argument String kontoName) {
		de.tmosebach.slowen.domain.Konto konto = kontoService.findByName(kontoName).orElseThrow();
		
		Konto result = new Konto();
		result.setName(konto.getName());
		result.setArt(konto.getArt());
		result.setBilanzPosition(konto.getBilanzPosition());
		result.setWaehrung(konto.getWaehrung());
		
		return result;
	}
	
	@QueryMapping
	public List<Konto> konten() {
		return kontoService.getKonten().stream()
				.map( domainKonto -> {
					Konto konto = new Konto();
					konto.setArt(domainKonto.getArt());
					konto.setBilanzPosition(domainKonto.getBilanzPosition());
					konto.setName(domainKonto.getName());
					konto.setWaehrung(domainKonto.getWaehrung());
					
					if (konto.getArt() == KontoArt.Konto) {
						addKontoSaldo(konto);
					} else {
						addDepotBestand(konto);
					}
					
					return konto;
				}).toList();
	}
	
	@QueryMapping
	public Vermoegen vermoegenReport(@Argument LocalDate stichtag) {
		Vermoegen vermoegen = new Vermoegen();

		kontoService.getKonten().stream()
			.filter( konto -> isBestandskonto(konto) )
			.forEach( domainKonto -> {
			Konto konto = new Konto();
			konto.setArt(domainKonto.getArt());
			konto.setBilanzPosition(domainKonto.getBilanzPosition());
			konto.setName(domainKonto.getName());
			konto.setWaehrung(domainKonto.getWaehrung());
			
			if (konto.getArt() == KontoArt.Konto) {
				addKontoSaldo(konto);
				vermoegen.addKonto(konto);
			} else {
				addDepotBestand(konto);
				bewerteDepotBestaende(konto.getBestaende());
				vermoegen.addBestaende(konto);
			}
		});
		
		return vermoegen;
	}

	private boolean isBestandskonto(de.tmosebach.slowen.domain.Konto konto) {
		BilanzPosition position = konto.getBilanzPosition();
		return position == BilanzPosition.Aktiv
				|| position == BilanzPosition.Passiv
				|| position == BilanzPosition.Kontokorrent;
	}

	private void bewerteDepotBestaende(List<Bestand> bestaende) {
		bestaende.forEach( bestand -> {
			Optional<Preis> preisOptional = 
					preisService.getLetztenPreis(bestand.getAsset().getIsin());
			if (preisOptional.isPresent()) {
				Preis preis = preisOptional.get();
				bestand.setDatum(preis.getDatum());
				bestand.setWert( bestand.getMenge().multiply(preis.getPreis()));
			} else {
				bestand.setWert(bestand.getEinstand());
			}
		});
		
	}

	private void addDepotBestand(Konto konto) {
		DepotBestand depotBestaende = kontoService.findDepotBestandByName(konto.getName());
		
		List<Bestand> bestaende = 
			depotBestaende.getBestaende().stream()
			.map( depotBestand -> {
				Bestand bestand = new Bestand();
				bestand.setAsset(
					map2Api(
						assetService.findAssetByIsin(
							depotBestand.getAsset()).orElseThrow() ));
				bestand.setMenge(depotBestand.getMenge());
				bestand.setEinstand(depotBestand.getEinstand());

				return bestand;
			})
			.toList();
		konto.setBestaende(bestaende);
	}

	private Asset map2Api(de.tmosebach.slowen.domain.Asset domainAsset) {
		Asset asset = new Asset();
		asset.setIsin(domainAsset.getIsin());
		asset.setName(domainAsset.getName());
		asset.setTyp(domainAsset.getTyp());
		asset.setWpk(domainAsset.getWpk());
		return asset;
	}

	private void addKontoSaldo(Konto konto) {
		KontoBestand kontoBestand =
				kontoService.findKontoBestandByName(konto.getName());
		konto.setSaldo(kontoBestand.getSaldo());
		konto.setDatum(kontoBestand.getDatum());
	}
}
