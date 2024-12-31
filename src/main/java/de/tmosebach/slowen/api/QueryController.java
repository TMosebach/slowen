package de.tmosebach.slowen.api;

import java.util.ArrayList;
import java.util.List;

import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import de.tmosebach.slowen.api.types.Bestand;
import de.tmosebach.slowen.api.types.Konto;
import de.tmosebach.slowen.domain.DepotBestand;
import de.tmosebach.slowen.domain.KontoBestand;
import de.tmosebach.slowen.domain.KontoService;
import de.tmosebach.slowen.values.KontoArt;

@Controller
public class QueryController {
	
	private KontoService kontoService;

	public QueryController(KontoService kontoService) {
		this.kontoService = kontoService;
	}

	@QueryMapping
	public List<String> buchungen(String konto) {
		return List.of();
	}

	@QueryMapping
	public Konto findKontoByName(String kontoName) {
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

	private void addDepotBestand(Konto konto) {
		DepotBestand depotBestaende = kontoService.findDepotBestandByName(konto.getName());
		
		List<Bestand> bestaende = 
			depotBestaende.getBestaende().stream()
			.map( depotBestand -> {
				Bestand bestand = new Bestand();
				bestand.setAsset(depotBestand.getAsset());
				bestand.setMenge(depotBestand.getMenge());
				bestand.setEinstand(depotBestand.getEinstand());

				return bestand;
			})
			.toList();
		konto.setBestaende(bestaende);
	}

	private void addKontoSaldo(Konto konto) {
		KontoBestand kontoBestand =
				kontoService.findKontoBestandByName(konto.getName());
		konto.setSaldo(kontoBestand.getSaldo());
		konto.setDatum(kontoBestand.getDatum());
	}
}
