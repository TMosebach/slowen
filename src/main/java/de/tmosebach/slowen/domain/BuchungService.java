package de.tmosebach.slowen.domain;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import de.tmosebach.slowen.values.KontoArt;

@Service
public class BuchungService {
	
	private KontoService kontoService;
	
	private List<Buchung> buchungen = new ArrayList<>();

	public BuchungService(KontoService kontoService) {
		this.kontoService = kontoService;
	}

	public void buche(Buchung buchung) {
		buchungen.add(buchung);
		
		buchung.getUmsaetze()
			.forEach( umsatz -> {
				if (umsatz.getArt()==KontoArt.Konto) {
					kontoService.bucheKontoUmsatz(umsatz);
				} else  {
					kontoService.bucheDepotUmsatz(umsatz);
				}
			});
	}
}
