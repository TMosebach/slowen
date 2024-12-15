package de.tmosebach.slowen.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class KontoService {
	
	private Map<String, Konto> konten = new HashMap<>();
	private Map<String, KontoBestand> kontoBestaende = new HashMap<>();

	public void neuesKonto(Konto konto) {
		String kontoName = konto.getName();
		
		konten.put(kontoName, konto);
		kontoBestaende.put(
				kontoName,
				new KontoBestand(kontoName, LocalDate.now(), BigDecimal.ZERO));
	}

	public Optional<Konto> findByName(String kontoName) {
		return Optional.ofNullable(konten.get(kontoName));
	}

	public void buche(KontoUmsatz kontoUmsatz) {
		KontoBestand kontoBestand = kontoBestaende.get(kontoUmsatz.getKonto());
		kontoBestand.setSaldo(kontoBestand.getSaldo().add(kontoUmsatz.getBetrag()));
		kontoBestand.setDatum(kontoUmsatz.getBuchung().getDatum());
	}

	public KontoBestand findKontoBestandByName(String kontoName) {
		return kontoBestaende.get(kontoName);
	}
}
