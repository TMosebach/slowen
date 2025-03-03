package de.tmosebach.slowen.reports;

import static java.util.Objects.isNull;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjuster;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import de.tmosebach.slowen.api.types.Vermoegensstand;
import de.tmosebach.slowen.domain.AssetService;
import de.tmosebach.slowen.domain.Buchung;
import de.tmosebach.slowen.domain.BuchungService;
import de.tmosebach.slowen.domain.Konto;
import de.tmosebach.slowen.domain.KontoService;
import de.tmosebach.slowen.domain.Umsatz;
import de.tmosebach.slowen.preis.PreisService;
import de.tmosebach.slowen.values.KontoArt;

@Controller
public class VermoegenEntwicklungReport {

	private Vermoegenscalculator vermoegenscalculator;
	private BuchungService buchungService;
	private KontoService kontoService;
	
	public VermoegenEntwicklungReport(
			Vermoegenscalculator vermoegenscalculator,
			BuchungService buchungService,
			KontoService kontoService) {
		this.vermoegenscalculator = vermoegenscalculator;
		this.buchungService = buchungService;
		this.kontoService = kontoService;
	}

	@QueryMapping
	public List<Vermoegensstand> vermoegenEntwicklungReport() {
		
		// Ergebnis zu den Stichtagen aufnehmen
		List<Vermoegensstand> entwicklung = new ArrayList<>();
		
		// Status fortschreiben
		KontoService kontoState = new KontoService();
		kontoService.getKonten().forEach( konto -> kontoState.neuesKonto(konto));
		
		List<Buchung> buchungen = buchungService.buchungen();
		
		// Der nächste Stichtag
		LocalDate ultimo = null;
		for (Buchung buchung : buchungen) {
			if (isNull(ultimo)) {
				// Erste Buchung -> Ultimo initialisieren
				ultimo = 
					buchung.getDatum()
					.with(TemporalAdjusters.lastDayOfMonth());
			} else if (ultimo.isBefore(buchung.getDatum())) {
				// Buchung ist nach aktuellem Ultimo
				entwicklung.add(calculateVermoegensstand(kontoState, ultimo));
				ultimo = nextUltimo(ultimo);
			}
			buchung.getUmsaetze().forEach( kontoState::bucheUmsatz );
		}
		// letzter Stand sichern
		entwicklung.add(calculateVermoegensstand(kontoState, ultimo));
		
		return entwicklung;
	}

	private LocalDate nextUltimo(LocalDate ultimo) {
		return ultimo.plusDays(1L).with(TemporalAdjusters.lastDayOfMonth());
	}

	private Vermoegensstand calculateVermoegensstand(KontoService kontoState, LocalDate stichtag) {
		return new Vermoegensstand(
				vermoegenscalculator.calculate(kontoState, stichtag), 
				stichtag);
	}
}
