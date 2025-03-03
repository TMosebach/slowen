package de.tmosebach.slowen.reports;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import org.springframework.stereotype.Component;

import de.tmosebach.slowen.domain.Bestand;
import de.tmosebach.slowen.domain.DepotBestand;
import de.tmosebach.slowen.domain.Konto;
import de.tmosebach.slowen.domain.KontoBestand;
import de.tmosebach.slowen.domain.KontoService;
import de.tmosebach.slowen.preis.Preis;
import de.tmosebach.slowen.preis.PreisService;
import de.tmosebach.slowen.values.BilanzPosition;

@Component
public class Vermoegenscalculator {
	
	private PreisService preisService;

	public Vermoegenscalculator(PreisService preisService) {
		this.preisService = preisService;
	}

	public BigDecimal calculate(KontoService kontoService, LocalDate stichtag) {

		return kontoService.getKonten().stream()
		.filter( konto -> isBestandskonto(konto) )
		.map( konto -> {

			return switch(konto.getArt()) {
				case Konto -> getSaldo(kontoService, konto);
				case Depot -> getDepotWert(kontoService, konto, stichtag);
			};
		})
		.reduce( BigDecimal::add )
		.get();
	}
	
	private BigDecimal getDepotWert(KontoService kontoService, Konto konto, LocalDate stichtag) {
		BigDecimal wert = BigDecimal.ZERO;
		
		DepotBestand depotBestaende = kontoService.findDepotBestandByName(konto.getName());
		for (Bestand bestand : depotBestaende.getBestaende()) {
			Optional<Preis> preisOptional = preisService.getPreis(bestand.getAsset(), stichtag);
			BigDecimal preis = bestand.getEinstand();
			if(preisOptional.isPresent()) {
				preis = preisOptional.get().getPreis();
			}
			wert = wert.add( bestand.getMenge().multiply(preis) );
		}
		return wert;
	}

	private BigDecimal getSaldo(KontoService kontoService, Konto konto) {
		KontoBestand kontoBestand = 
				kontoService.findKontoBestandByName(konto.getName());
		return kontoBestand.getSaldo();
	}
	
	private boolean isBestandskonto(de.tmosebach.slowen.domain.Konto konto) {
		BilanzPosition position = konto.getBilanzPosition();
		return position == BilanzPosition.Aktiv
				|| position == BilanzPosition.Passiv
				|| position == BilanzPosition.Kontokorrent;
	}
}
