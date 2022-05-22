package de.tmosebach.slowen.backend.jpaadapter;

import static java.util.Objects.nonNull;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import javax.validation.Validator;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import de.tmosebach.slowen.backend.domain.Asset;
import de.tmosebach.slowen.backend.domain.AssetRepository;
import de.tmosebach.slowen.backend.domain.Bestand;
import de.tmosebach.slowen.backend.domain.BuchhaltungService;
import de.tmosebach.slowen.backend.domain.Buchung;
import de.tmosebach.slowen.backend.domain.BuchungRepository;
import de.tmosebach.slowen.backend.domain.Konto;
import de.tmosebach.slowen.backend.domain.KontoRepository;
import de.tmosebach.slowen.backend.domain.Umsatz;
import de.tmosebach.slowen.backend.values.Betrag;
import de.tmosebach.slowen.backend.values.Kontorahmen;
import de.tmosebach.slowen.backend.values.Menge;

@Service
public class BuchhaltungServiceJpa implements BuchhaltungService {
	
	private Validator validator;
	private BuchungRepository buchungRepository;
	private KontoRepository kontoRepository;
	private AssetRepository assetRepository;

	public BuchhaltungServiceJpa(
			Validator validator,
			BuchungRepository buchungRepository,
			KontoRepository kontoRepository,
			AssetRepository assetRepository) {
		this.validator = validator;
		this.buchungRepository = buchungRepository;
		this.kontoRepository = kontoRepository;
		this.assetRepository = assetRepository;
	}

	@Transactional
	public Buchung buche(Buchung buchung) {

        Set<ConstraintViolation<Buchung>> violations = validator.validate(buchung);

        if (!violations.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            boolean notFirst = false;
            for (ConstraintViolation<Buchung> constraintViolation : violations) {
            	if (notFirst) {
            		sb.append(", ");
            	}
                sb.append(constraintViolation.getMessage());
                notFirst = true;
            }
            throw new ConstraintViolationException(sb.toString(), violations);
        }

        for (Umsatz umsatz : buchung.getUmsaetze()) {
			if (isSkontroUmsatz(umsatz)) {
				
				switch (buchung.getArt()) {
				case Buchung:
					buchen(buchung);
					break;
				case Kauf:
				case Einlieferung:
					skontroZugang(umsatz);
					break;
					
				case Verkauf:
					skontroAbgang(buchung, umsatz);
					break;

				case Ertrag:
					skontroErtrag(umsatz);
					break;
				default:
					// Darf nicht passieren
					throw new IllegalArgumentException();
				}
				
			} else {
				saldoAnpassen(umsatz);
			}
		}
        
		buchungRepository.save(buchung);
		
		return buchung;
	}

	/**
	 * Ertrag einem Depot zuordnen.
	 * 
	 * Die Betragszuordnung erfolgt durch das Asset. Der Bestand
	 * ändert sich bei einem Ertrag nicht.
	 * 
	 * @param umsatz Skontro-Umsatz eines Ertrages.
	 */
	private void skontroErtrag(Umsatz umsatz) {
		Konto depot = getOrCreateKonto(umsatz.getKonto());
		Asset asset = getOrCreateAsset(umsatz.getAsset());
		
		umsatz.setKonto(depot);
		umsatz.setAsset(asset);

		kontoRepository.save(depot);
	}

	private void buchen(Buchung buchung) {
		buchung.getUmsaetze().stream().forEach( umsatz -> saldoAnpassen( umsatz ));
	}

	private boolean isSkontroUmsatz(Umsatz umsatz) {
		return nonNull(umsatz.getAsset());
	}

	private void skontroAbgang(Buchung buchung, Umsatz umsatz) {
		Konto depot = getOrCreateKonto(umsatz.getKonto());
		Asset asset = getOrCreateAsset(umsatz.getAsset());
		
		umsatz.setKonto(depot);
		umsatz.setAsset(asset);
		Optional<Bestand> bestandOptional = depot.findeBestand(asset);
		Bestand bestand = bestandOptional.get();

		double abgabeAnteil = calcAbgabeAnteil(bestand.getMenge(), umsatz.getMenge());
		bestand.addMenge(umsatz.getMenge());
		if (bestand.isEmpty()) {
			depot.remove(bestand);
		}
		
		Betrag abzugebenderWert = bestand.getEinstandsWert().mal(abgabeAnteil);
		bestand.addEinstandswert(abzugebenderWert);
		
		Betrag differenz = umsatz.getBetrag().minus(abzugebenderWert).invert();
		if(differenz.isPositiv()) {
			// Die Gegenbuchung muss einen negativen Betrag haben.
			saldoAnpassen(
					createUmsatz(
							getOrCreateKonto(Kontorahmen.Kursgewinn.getKontoRef()),
							umsatz.getValuta(),
							differenz.invert() ));
		} else if (differenz.isNegativ()) {
			saldoAnpassen(
					createUmsatz(
							getOrCreateKonto(Kontorahmen.Kursverlust.getKontoRef()),
							umsatz.getValuta(),
							differenz.invert() ));
		}
		kontoRepository.save(depot);
	}
	
	private Umsatz createUmsatz(Konto konto, LocalDate valuta, Betrag betrag) {
		Umsatz umsatz = new Umsatz();
		umsatz.setKonto(konto);
		umsatz.setValuta(valuta);
		umsatz.setBetrag(betrag); 
		return umsatz;
	}

	/**
	 * Ermittlung des relativen Anteils
	 * 
	 * <b>Vorbedingung:</b>Die Einheiten der Mengen sind identisch.
	 * 
	 * @param basis
	 * @param anteil
	 * @return relative Anteil an der Basis (0-1)
	 */
	private double calcAbgabeAnteil(Menge basis, Menge anteil) {
		
		return anteil.getMenge().doubleValue() / basis.getMenge().doubleValue();
	}

	/**
	 * Bestand im Depot anpassen.
	 * 
	 * Das Depot ist im Zweifel mit der Saldoanpassung entstanden.
	 * 
	 * @param umsatz
	 */
	private void skontroZugang(Umsatz umsatz) {
		Konto depot = getOrCreateKonto(umsatz.getKonto());
		Asset asset = getOrCreateAsset(umsatz.getAsset());
		
		umsatz.setKonto(depot);
		umsatz.setAsset(asset);
		Bestand bestand = 
				depot.findeBestand(asset).orElseGet( () -> {
			Bestand newBestand = new Bestand(asset);
			depot.addBestand(newBestand);
			newBestand.setKonto(depot);
			return newBestand;
		});

		bestand.addMenge(umsatz.getMenge());
		bestand.addEinstandswert(umsatz.getBetrag());

		kontoRepository.save(depot);
	}

	private Asset getOrCreateAsset(Asset assetRef) {
		Long id = assetRef.getId();
		if (nonNull(id)) {
			Optional<Asset> persistentAsset = assetRepository.findById(id);
			if (persistentAsset.isPresent()) {
				return persistentAsset.get();
			}
		}

		String assetName = assetRef.getName();
		Optional<Asset> persistentAsset = assetRepository.findByName(assetName);
		Asset asset = 
			persistentAsset.orElseGet(() -> {
				Asset newAsset = new Asset();
				newAsset.setName(assetName);
				return saveAsset(newAsset);
			});
		
		return asset;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	private Asset saveAsset(Asset asset) {
		return assetRepository.save(asset);
	}

	private void saldoAnpassen(Umsatz umsatz) {
		Konto konto = getOrCreateKonto(umsatz.getKonto());
		umsatz.setKonto(konto);
		konto.setSaldo( konto.getSaldo().add( umsatz.getBetrag() ));
	}
	
	private Konto getOrCreateKonto(Konto kontoRef) {
		Long id = kontoRef.getId();
		if (nonNull(id)) {
			Optional<Konto> persistentKonto = kontoRepository.findById(id);
			if (persistentKonto.isPresent()) {
				return persistentKonto.get();
			}
		}

		String kontoName = kontoRef.getName();
		Optional<Konto> persistentKonto = kontoRepository.findByName(kontoName);
		Konto konto = 
			persistentKonto.orElseGet(() -> {
				Konto newKonto = new Konto();
				newKonto.setName(kontoName);
				return saveKonto(newKonto);
			});
		
		return konto;
	}
	
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	private Konto saveKonto(Konto konto) {
		return kontoRepository.save(konto);
	}

	public List<Konto> getKontorahmen() {
		return kontoRepository.findAll();
	}

	/**
	 * Lesen eines Ausschnitts aus der Buchungsliste eines Kontos.
	 * 
	 * Es kommen die jüngsten/zu letzt ergänzten Buchungen zu erst.
	 * 
	 * Die Liste enthält den Buchungsausschnitt mit der angegebenen größe.
	 * 
	 * @param id des Kontos
	 * @param page Seitennummer beginnend mit 0
	 * @param size Seitengröße
	 */
	public Page<Buchung> findBuchungenByKonto(Long id, int page, int size) {
		
		Pageable pageable = PageRequest.of(page, size);		
		Page<Buchung> kontoBuchungen = buchungRepository.findByKonto(id, pageable);
		return kontoBuchungen;
	}

	public List<Asset> getAssets() {
		return assetRepository.findAll();
	}

	@Override
	public Konto getKontoById(Long id) {
		return kontoRepository.getById(id);
	}

	@Override
	public List<Buchung> searchBuchungen(String query) {
		List<Buchung> result = new ArrayList<>();
		return result;
	}

	@Override
	public long countBuchungenByKonto(Long kontoId) {
		return buchungRepository.countKontoBuchungenByKonto(kontoId);
	}

	@Override
	public Konto createKonto(Konto konto) {
		Konto neuesKonto = kontoRepository.save(konto);
		return neuesKonto;
	}

	@Override
	public Asset createAsset(Asset asset) {
		Asset neuesAsset = assetRepository.save(asset);
		return neuesAsset;
	}
}
