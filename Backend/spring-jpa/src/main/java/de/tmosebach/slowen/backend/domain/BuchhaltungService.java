package de.tmosebach.slowen.backend.domain;

import static de.tmosebach.slowen.backend.domain.KontoFactory.*;
import static java.math.BigDecimal.valueOf;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BuchhaltungService {
	
	@Autowired
	private KontoRepository kontoRepository;
	
	@Autowired
	private DepotRepository depotRepository;
	
	@Autowired
	private BuchungRepository buchungRepository;
	
	@Autowired
	private AssetRepository assetRepository;

	public List<Konto> findKonten() {
		return kontoRepository.findAll();
	}
	
	public Konto kontoAnlegen(Konto konto) {
		return kontoRepository.save(konto);
	}
	
	public Depot depotAnlegen(Depot depot) {
		return depotRepository.save(depot);
	}
	
	@Transactional
	public Buchung buchen(Buchung buchung) {
		
		kontoSaldenAnpassen(buchung.getUmsaetze());
		return buchungRepository.save(buchung);
	}
	
	private void kontoSaldenAnpassen(List<Umsatz> umsaetze) {
		umsaetze.forEach( umsatz -> {
			Konto konto = findKontoById(umsatz.getKonto().getId());
			konto.setSaldo(konto.getSaldo().add(umsatz.getBetrag()));
			kontoRepository.save(konto);
		});
	}

	private Konto findKontoById(Long id) {
		return kontoRepository.findById(id)
				.orElseThrow( 
					() -> new IllegalStateException("Unbekanntes Konto: "+id));
	}

	@Transactional
	public Buchung kauf(Buchung buchung) {
		List<Umsatz> umsaetze = buchung.getUmsaetze();
		kontoSaldenAnpassen(umsaetze);
		Umsatz depotUmsatz = findDepotUmsatz(umsaetze);
		handleZugangBestand(depotUmsatz);
		return buchungRepository.save(buchung);
	}
	
	private void handleZugangBestand(Umsatz umsatz) {
		Depot depot = (Depot)findKontoById(umsatz.getKonto().getId());
		Optional<Bestand> bestandOptional = 
				depot.getBestaende().stream()
				.filter( b -> b.getAsset().equals(umsatz.getAsset()))
				.findAny();

		if (bestandOptional.isEmpty()) {
			Bestand bestand = new Bestand();
			bestand.setAsset(umsatz.getAsset());
			bestand.setWert(umsatz.getBetrag());
			bestand.setMenge(umsatz.getMenge());
			depot.addBestand(bestand);
		} else {
			Bestand bestand = bestandOptional.get();
			bestand.setWert( bestand.getWert().add(umsatz.getBetrag()) );
			bestand.setMenge( bestand.getMenge().add(umsatz.getMenge()) );
		}
		depotRepository.save(depot);
	}
	
	@Transactional
	public Buchung verkauf(Buchung buchung) {
		List<Umsatz> umsaetze = buchung.getUmsaetze();
		kontoSaldenAnpassen(umsaetze);
		Umsatz depotUmsatz = findDepotUmsatz(umsaetze);
		Umsatz guvUmsatz = handleVerkaufBestandAndGuV(depotUmsatz);
		buchung.addUmsatz(guvUmsatz);
		return buchungRepository.save(buchung);
	}
	
	private Umsatz handleVerkaufBestandAndGuV(Umsatz umsatz) {
		Depot depot = (Depot)findKontoById(umsatz.getKonto().getId());
		Optional<Bestand> bestandOptional = 
				depot.getBestaende().stream()
				.filter( b -> b.getAsset().equals(umsatz.getAsset()))
				.findAny();

		if (bestandOptional.isEmpty()) {
			throw new IllegalStateException("Verkauf eines nicht existenden Bestandes.");
		}
		Bestand bestand = bestandOptional.get();
		
		double verkaufsAnteil = -umsatz.getMenge().doubleValue() / bestand.getMenge().doubleValue();
		double einstandsWert = verkaufsAnteil * bestand.getWert().doubleValue();
		double guv = -umsatz.getBetrag().doubleValue() - einstandsWert;
		
		bestand.setWert( bestand.getWert().subtract(valueOf(einstandsWert)) );
		bestand.setMenge( bestand.getMenge().add(umsatz.getMenge()) );
		
		depotRepository.save(depot);
		
		Umsatz guvUmsatz = null;
		if (guv > 0) {
			guvUmsatz = erstelleGewinn(guv, umsatz.getValuta());
		} else {
			guvUmsatz = erstelleVerlust(guv, umsatz.getValuta());
		}
		return guvUmsatz;
	}

	private Umsatz erstelleVerlust(double guvWert, LocalDate valuta) {
		Optional<Konto> kursGewinnKontoOptional = kontoRepository.findByName(KURS_VERLUST);
		Konto kursGewinnKonto = kursGewinnKontoOptional.orElse( kontoAnlegen(kursVerlust()) );
		BigDecimal guv = valueOf(-guvWert);
		kursGewinnKonto.setSaldo( kursGewinnKonto.getSaldo().add(guv));
		
		kontoRepository.save(kursGewinnKonto);
		
		Umsatz umsatz = new Umsatz();
		umsatz.setKonto(kursGewinnKonto);
		umsatz.setBetrag(guv);
		umsatz.setValuta(valuta);
		return umsatz;
	}

	private Umsatz erstelleGewinn(double guvWert, LocalDate valuta) {
		Optional<Konto> kursGewinnKontoOptional = kontoRepository.findByName(KURS_GEWINN);
		Konto kursGewinnKonto = kursGewinnKontoOptional.orElse( kontoAnlegen(kursGewinn()) );
		BigDecimal guv = valueOf(-guvWert);
		kursGewinnKonto.setSaldo( kursGewinnKonto.getSaldo().add(guv));
		
		kontoRepository.save(kursGewinnKonto);
		
		Umsatz umsatz = new Umsatz();
		umsatz.setKonto(kursGewinnKonto);
		umsatz.setBetrag(guv);
		umsatz.setValuta(valuta);
		return umsatz;
	}

	private Umsatz findDepotUmsatz(List<Umsatz> umsaetze) {
		return umsaetze.stream()
				.filter( u -> (u.getKonto() instanceof Depot) )
				.findFirst().get();
	}

	@Transactional
	public Buchung ertrag(Buchung buchung) {
		return buchen(buchung);
	}
	
	public Page<Buchung> findBuchungenByKonto(Long id, int number, int size) {
		Pageable pageable = PageRequest.of((int)number, (int)size);
		Page<Buchung> page = buchungRepository.findByKonto(id, pageable);
		return page;
	}
	
	public Asset neuesAsset(Asset asset) {
		return assetRepository.save(asset);
	}
	
	public List<Asset> findAssets() {
		return assetRepository.findAll();
	}

	public Buchung einlieferung(Buchung buchung) {
		Umsatz depotUmsatz = findDepotUmsatz(buchung.getUmsaetze());
		
		handleZugangBestand(depotUmsatz);
		
		return buchungRepository.save(buchung);
	}
}
