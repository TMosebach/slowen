package de.tmosebach.slowen.buchhaltung.model;

import static java.util.Objects.isNull;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import de.tmosebach.slowen.exceptions.UnkownEntityException;

@Service
public class BuchungService {
	
	@Autowired
	private KontoService kontoService;
	
	@Autowired
	private AssetsRepository assetRepository;
	
	@Autowired
	private BuchungRepository buchungRepository;

	@Transactional
	public Long buche(Buchung template) throws UnkownEntityException {
		
		Buchung buchung = new Buchung();
		buchung.setEmpfaenger(template.getEmpfaenger());
		buchung.setVerwendung(template.getVerwendung());
		
		for (KontoUmsatz umsatz : template.getUmsaetze()) {
			verarbeiteUmsatz(buchung, umsatz); 
		}

		buchungRepository.save(buchung);
		
		return buchung.getId();
	}

	/**
	 * Einer Buchung einen neuen Umsatz hinzufügen und im Konto verbuchen.
	 * 
	 * Für DepotUmsätze ist zusätzlich der Bestand zu pflegen
	 * 
	 * @param buchung
	 * @param umsatz
	 * @throws UnkownEntityException Refernziertes Konto wurde nicht gefunden.
	 * @throws IllegalDataException
	 */
	private void verarbeiteUmsatz(Buchung buchung, KontoUmsatz umsatz) throws UnkownEntityException {
	
		Konto konto = findeKonto(umsatz);
		konto.addKontoUmsatz(umsatz);
		buchung.addUmsatz(umsatz);
		checkAndSetValuta(umsatz);
		
		if (umsatz instanceof DepotUmsatz) {
			verarbeiteBestand(konto, (DepotUmsatz)umsatz);
		}

		kontoService.update(konto);
	}
	
	private void verarbeiteBestand(Konto konto, DepotUmsatz umsatz) {
		if (! (konto instanceof Depot)) {
			throw new IllegalArgumentException("Depotumsätze sind nur für Depots zulässig.");
		}
		Depot depot = (Depot)konto;
		
		// TODO Fehlen abfangen
		Asset asset = assetRepository.findById(umsatz.getAsset().getId()).get();
		umsatz.setAsset(asset); // Template durch die Entität austauschen
		
		Bestand bestand = findOrCreateBestand(depot, asset);

		if (isWert0(umsatz.getMenge(), 0.001)) {
			// keine Bestandsänderung => Ertragsbuchung
			// Nur Dokumentation der Abhängigkeit zum Asset
		} else if(umsatz.getMenge().doubleValue() > 0) {
			// Zugang: Kauf oder Eingang
			bestand.addKaufwert(umsatz.getBetrag());
			bestand.addMenge(umsatz.getMenge());
		} else {
			// Abgang: Verkauf oder Auslieferung, ggf. anteilig
			BigDecimal verkaufsanteil = umsatz.getMenge().divide(bestand.getMenge(), 4, RoundingMode.HALF_UP);
			
			if (verkaufsanteil.compareTo(BigDecimal.ONE.negate()) < 0) {
				throw new IllegalArgumentException("Es kann höchstens der Bestand verkauft werden.");
			}
			
			BigDecimal abgehenderKaufwert = bestand.getKaufwert().multiply(verkaufsanteil);
			bestand.addKaufwert(abgehenderKaufwert);
			bestand.addMenge(umsatz.getMenge());

			/*
			 *  Gewinn und Verlust ergänzen
			 *  für die Gegenbuchung auf dem Erfolgskonto ist der Betrag zu negieren
			 */
			BigDecimal gewinnVerlust = umsatz.getBetrag().subtract(abgehenderKaufwert);
			
			KontoUmsatz guv = new KontoUmsatz();
			umsatz.getBuchung().addUmsatz(guv);
			guv.setValuta(umsatz.getValuta());
			if (gewinnVerlust.compareTo(BigDecimal.ZERO) > 0) {
				guv.setBetrag(gewinnVerlust);
				kontoService.getKursgewinn().addKontoUmsatz(guv);
			} else {
				guv.setBetrag(gewinnVerlust.negate());
				kontoService.getKursverlust().addKontoUmsatz(guv);
			}
			
			/*
			 * Justieren des Depotwertes nach G/V-Verbuchung
			 */
			umsatz.setBetrag(abgehenderKaufwert);
		}
	}

	private boolean isWert0(BigDecimal wert, double genauigkeit) {
		if (isNull(wert)) {
			return true;
		}
		return Math.abs(wert.doubleValue()) < genauigkeit;
	}
		

	private Bestand findOrCreateBestand(Depot depot, Asset asset) {
		Optional<Bestand> zielBestand = 
				depot.getBestaende().stream()
				.filter( bestand -> bestand.getAsset().equals(asset))
				.findFirst();
		return zielBestand.orElseGet( () -> createBestand(depot, asset));
	}

	private Bestand createBestand(Depot depot, Asset asset) {
		
		Bestand bestand = new Bestand();
		bestand.setAsset(asset);
		depot.addBestand(bestand);
		
		return bestand;
	}

	/**
	 * Konto zu Umsatz finden
	 * 
	 * @param u
	 * @return
	 * @throws UnkownEntityException Refernziertes Konto wurde nicht gefunden.
	 */
	private Konto findeKonto(KontoUmsatz u) throws UnkownEntityException {

		Optional<Konto> konto = kontoService.findById(u.getKonto().getId());
		Konto result = konto.orElseThrow(() -> new UnkownEntityException("Kein Konto mit Namen: " + u.getKontoName()));
		return result;
	}
	
	/**
	 * Valuta ist ein Pflichtfeld.
	 * 
	 * Ist sie nicht definiert, setzt die Methode das Tagesdatum
	 * 
	 * @param u Umsatz für zu prüfende Valuta
	 */
	private void checkAndSetValuta(KontoUmsatz u) {
		if(isNull(u.getValuta())) {
			u.setValuta(LocalDate.now());
		}
	}
	
	public int countKontoBuchungenByKonto(Long kontoId) {
		return buchungRepository.countKontoBuchungenByKonto(kontoId);
	}

	public List<Buchung> findKontoBuchungenByKonto(Long kontoId, long pageNr, long size) {

		Pageable pageable = PageRequest.of((int)pageNr, (int)size);
		Page<Buchung> page = buchungRepository.findByKonto(kontoId, pageable);
		return page.getContent();
	}
}
