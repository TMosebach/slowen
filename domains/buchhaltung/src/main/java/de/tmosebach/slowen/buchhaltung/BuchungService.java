package de.tmosebach.slowen.buchhaltung;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import de.tmosebach.slowen.konten.Bestand;
import de.tmosebach.slowen.konten.Depot;
import de.tmosebach.slowen.konten.Konto;
import de.tmosebach.slowen.konten.SimpleKonto;
import de.tmosebach.slowen.konten.KontoService;
import de.tmosebach.slowen.konten.KontoType;
import de.tmosebach.slowen.shared.values.AssetIdentifier;
import de.tmosebach.slowen.shared.values.Betrag;
import de.tmosebach.slowen.shared.values.KontoIdentifier;
import de.tmosebach.slowen.shared.values.Page;

@Service
public class BuchungService {
	
	private KontoService kontoService;
	private BuchungRepository buchungRepository;

	public BuchungService(KontoService kontoService, BuchungRepository buchungRepository) {
		this.kontoService = kontoService;
		this.buchungRepository = buchungRepository;
	}

	public Buchung buche(Buchung buchung) {
		
		buchungRepository.save(buchung);
		
		buchung.getUmsaetze().forEach( umsatz -> {
			buchungRepository.saveUmsatz(umsatz);

			uebernehmeInsHauptbuch(umsatz);
		});
		return buchung;
	}
	
	public Page<Buchung> findBuchung(BuchungSelection selection) {
		int count = buchungRepository.count(selection);
		List<Buchung> content = buchungRepository.findBuchungPagedByKonto(selection);
		
		return
			new Page<Buchung>()
			.elementCount(count)
			.content(content)
			.page(selection.getPage())
			.size(selection.getSize());
	}

	private void uebernehmeInsHauptbuch(Umsatz umsatz) {
		Konto konto = 
			kontoService.findById(umsatz.getKonto())
			.orElseThrow( () -> new IllegalArgumentException("Unbekanntes Konto: "+umsatz.getKonto()) );
		
		if (konto.getType() == KontoType.Depot) {
			bucheBestand((Depot)konto, umsatz)
			.ifPresent( guv -> bucheUmsatz(guv));
		} else {
			bucheUmsatz((SimpleKonto)konto, umsatz);
		}
	}

	private void bucheUmsatz(Umsatz guv) {
		Konto konto = 
				kontoService.findById(guv.getKonto())
				.orElseThrow( () -> new IllegalStateException("Basiskonto Kursverlust nicht gefunden.") );
		bucheUmsatz((SimpleKonto)konto, guv);
	}

	private void bucheUmsatz(SimpleKonto konto, Umsatz umsatz) {
		konto.addToSaldo(umsatz.getBetrag());
		kontoService.update(konto);
	}

	private Optional<Umsatz> bucheBestand(Depot depot, Umsatz umsatz) {
		Bestand bestand = findOrCreateBestand(depot, umsatz);
		
		Optional<Umsatz> result = Optional.empty();
		if (umsatz.getBetrag().istPositiv()) {
			zugangNebenbuch(umsatz, bestand);
		} else {
			result = abgangNebenbuch(umsatz, bestand);
		}
		kontoService.merge(bestand);
		
		return result;
	}

	private Optional<Umsatz> abgangNebenbuch(Umsatz umsatz, Bestand bestand) {

		double anteilAbgang = umsatz.getMenge().doubleValue() / bestand.getMenge().doubleValue();
		Betrag abgehnderKaufwert = bestand.getKaufWert().multiply(anteilAbgang);
		Betrag guvInvers = abgehnderKaufwert.subtract(umsatz.getBetrag());
		
		bestand.addBestand(umsatz.getMenge(), abgehnderKaufwert);
		
		if (guvInvers.istPositiv()) {
			return Optional.of(createKursGewinnUmsatz(umsatz, guvInvers));
		} else if (guvInvers.istNegativ()) {
			return Optional.of(createKursVerlustUmsatz(umsatz, guvInvers));
		}
		return Optional.empty();
	}

	private Umsatz createKursGewinnUmsatz(Umsatz umsatz, Betrag guvInvers) {
		return createGuvUmsatz(Basiskonten.KURSGEWINN, umsatz, guvInvers);
	}

	private Umsatz createGuvUmsatz(KontoIdentifier konto, Umsatz umsatz, Betrag guvInvers) {
		return new Umsatz(
					umsatz.getBuchungIdentifier(), 
					konto,
					umsatz.getValuta(),
					guvInvers);
	}

	private Umsatz createKursVerlustUmsatz(Umsatz umsatz, Betrag guvInvers) {
		return createGuvUmsatz(Basiskonten.KURSVERLUST, umsatz, guvInvers);
	}

	private void zugangNebenbuch(Umsatz umsatz, Bestand bestand) {
		bestand.addBestand(umsatz.getMenge(), umsatz.getBetrag());
	}

	private Bestand findOrCreateBestand(Depot depot, Umsatz umsatz) {
		AssetIdentifier asset = umsatz.getAsset();
		Bestand bestand = 
			depot.findBestand(asset)
			.orElseGet( () -> depot.addBestand(new Bestand(depot.getId(), asset)));
		return bestand;
	}
}
