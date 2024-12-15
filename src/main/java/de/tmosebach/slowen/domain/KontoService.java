package de.tmosebach.slowen.domain;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import de.tmosebach.slowen.api.types.Konto;

@Service
public class KontoService {
	
	private Map<String, Konto> konten = new HashMap<>();

	public void neuesKonto(Konto konto) {
		konten.put(konto.getName(), konto);
	}

	public Optional<Konto> findByName(String kontoName) {
		return Optional.ofNullable(konten.get(kontoName));
	}

}
