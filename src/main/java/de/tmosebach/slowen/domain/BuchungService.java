package de.tmosebach.slowen.domain;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class BuchungService {
	
	private KontoService kontoService;
	
	private List<Buchung> buchungen = new ArrayList<>();

	public BuchungService(KontoService kontoService) {
		this.kontoService = kontoService;
	}

	public void buche(Buchung buchung) {
		buchungen.add(buchung);
		
		buchung.getUmsaetze().forEach( kontoService::bucheUmsatz );
	}

	public List<Buchung> findBuchungenZuKonto(String zielKonto) {
		return buchungen.stream()
				.filter( buchung -> buchungZu(buchung, zielKonto))
				.toList();
	}

	private boolean buchungZu(Buchung buchung, String zielKonto) {
		return buchung.getUmsaetze().stream()
				.filter( umsatz -> umsatz.getKonto().equals(zielKonto))
				.findFirst()
				.isPresent();
	}
	
	public List<Buchung> buchungen() {
		return buchungen.stream().sorted( (b1, b2) -> b1.getDatum().compareTo(b2.getDatum())).toList();
	}
}
