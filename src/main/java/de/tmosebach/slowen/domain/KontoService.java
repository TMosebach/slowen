package de.tmosebach.slowen.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import de.tmosebach.slowen.values.KontoArt;

@Service
public class KontoService {
	
	private Map<String, Konto> konten = new HashMap<>();
	private Map<String, KontoBestand> kontoBestaende = new HashMap<>();
	private Map<String, DepotBestand> depotBestaende = new HashMap<>();

	public void neuesKonto(Konto konto) {
		String kontoName = konto.getName();
		
		konten.put(kontoName, konto);
		
		if (konto.getArt() == KontoArt.Konto) {
			kontoBestaende.put(
				kontoName,
				new KontoBestand(kontoName, LocalDate.now(), BigDecimal.ZERO));
		} else {
			depotBestaende.put(kontoName, new DepotBestand(kontoName));
		}
	}

	public Optional<Konto> findByName(String kontoName) {
		return Optional.ofNullable(konten.get(kontoName));
	}
	
	public void bucheUmsatz(Umsatz umsatz) {
		if (umsatz.getArt()==KontoArt.Konto) {
			bucheKontoUmsatz(umsatz);
		} else  {
			bucheDepotUmsatz(umsatz);
		}
	}

	private void bucheKontoUmsatz(Umsatz umsatz) {
		KontoUmsatz kontoUmsatz = (KontoUmsatz)umsatz;
		KontoBestand kontoBestand = kontoBestaende.get(kontoUmsatz.getKonto());
		kontoBestand.setSaldo(kontoBestand.getSaldo().add(kontoUmsatz.getBetrag()));
		kontoBestand.setDatum(kontoUmsatz.getBuchung().getDatum());
	}
	
	private void bucheDepotUmsatz(Umsatz umsatz) {
		DepotUmsatz depotUmsatz = (DepotUmsatz)umsatz;
		
		DepotBestand depotBestand = depotBestaende.get(umsatz.getKonto());
		
		Optional<Bestand> bestandResult = depotBestand.getBestandZu(depotUmsatz.getAsset());
		Bestand bestand = bestandResult.orElseGet( () -> {
			Bestand newBestand = new Bestand();
			newBestand.setAsset(depotUmsatz.getAsset());
			depotBestand.add(newBestand);
			return newBestand;
		});
		
		bestand.setMenge( bestand.getMenge().add(depotUmsatz.getMenge()));
		bestand.setEinstand( bestand.getEinstand().add( depotUmsatz.getBetrag() ));
	}

	public KontoBestand findKontoBestandByName(String kontoName) {
		return kontoBestaende.get(kontoName);
	}

	public DepotBestand findDepotBestandByName(String depotName) {
		return depotBestaende.get(depotName);
	}

	public List<Konto> getKonten() {
		
		return new ArrayList<>( konten.values() );
	}
}
