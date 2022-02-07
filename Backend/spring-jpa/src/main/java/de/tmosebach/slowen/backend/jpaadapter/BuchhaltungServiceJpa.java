package de.tmosebach.slowen.backend.jpaadapter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import javax.validation.Validator;

import org.springframework.stereotype.Service;

import de.tmosebach.slowen.backend.domain.Asset;
import de.tmosebach.slowen.backend.domain.BuchhaltungService;
import de.tmosebach.slowen.backend.domain.Buchung;
import de.tmosebach.slowen.backend.domain.BuchungRepository;
import de.tmosebach.slowen.backend.domain.Konto;
import de.tmosebach.slowen.backend.domain.KontoRepository;
import de.tmosebach.slowen.backend.domain.Umsatz;

@Service
public class BuchhaltungServiceJpa implements BuchhaltungService {
	
	private Validator validator;
	private BuchungRepository buchungRepository;
	private KontoRepository kontoRepository;
	
	private List<Buchung> buchungen = new ArrayList<>();
	private Map<String, Konto> kontorahmen = new HashMap<>();
	private Set<Asset> assets = new HashSet<>();

	public BuchhaltungServiceJpa(
			Validator validator,
			BuchungRepository buchungRepository,
			KontoRepository kontoRepository) {
		this.validator = validator;
		this.buchungRepository = buchungRepository;
		this.kontoRepository = kontoRepository;
		
		List<Buchung> buchungen = buchungRepository.findAll();
		buchungen.forEach( buchung -> buche(buchung));
	}

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
        
        buchungen.add(buchung);
        buchungRepository.save(buchung);
        
		switch (buchung.getArt()) {
		case Buchung: // TODO zum Pflichtfeld machen

		default:
			bucheBuchung(buchung);
			break;
		}
		
		
		return buchung;
	}

	private void bucheBuchung(Buchung buchung) {
		buchung.getUmsaetze().stream().forEach( umsatz -> saldoAnpassen( umsatz ));
	}

	private void saldoAnpassen(Umsatz umsatz) {
		Konto konto = getOrCreate(umsatz.getKonto());
		konto.setSaldo( konto.getSaldo().add( umsatz.getBetrag() ));
	}
	
	private Konto getOrCreate(String kontoName) {
		if (kontorahmen.containsKey(kontoName)) {
			return kontorahmen.get(kontoName);
		}
		
		Optional<Konto> persistentKonto = kontoRepository.findByName(kontoName);
		Konto konto = 
			persistentKonto.orElseGet(() -> {
				Konto newKonto = new Konto(kontoName);
				kontoRepository.save(newKonto);
				return newKonto;
			});
		kontorahmen.put(kontoName, konto);
		
		return konto;
	}

//	private void berechneNeueSalden(Buchung buchung) {
//		buchung.getUmsaetze().stream().forEach( umsatz -> {
//			String kontoName = umsatz.getKonto();
//			Konto konto = null;
//			if (kontorahmen.containsKey(kontoName)) {
//				konto = kontorahmen.get(kontoName);
//			} else {
//				konto = new Konto(kontoName);
//				checkPersistenceAndSave(konto);
//				kontorahmen.put(kontoName, new Konto(kontoName));
//			}
//			konto.setSaldo( konto.getSaldo().add(umsatz.getBetrag()) );
//			
//			checkAndAddSkontro(konto, umsatz);
//		});
//	}
//
//	private void checkPersistenceAndSave(Konto konto) {
//		Optional<Konto> persistentKonto = kontoRepository.findByName(konto.getName());
//		
//		if (persistentKonto.isEmpty()) {
//			kontoRepository.save(konto);
//		}
//	}
//
//	private void checkAndAddSkontro(Konto konto, Umsatz umsatz) {
//		Asset asset = umsatz.getAsset();
//		if (nonNull(asset)) {
//			
//			if (!assets.contains(asset)) {
//				assets.add(asset);
//			}
//			
//			Optional<Bestand> result = konto.getBestandByAssetName(asset.getName());
//			Bestand bestand = null;
//			if (result.isPresent()) {
//				bestand = result.get();
//			} else {
//				bestand = new Bestand(asset);
//				konto.addBestand(bestand);
//			}
//			bestand.addMenge(umsatz.getMenge());
//		}
//	}

	

	public List<Konto> getKontorahmen() {
		return new ArrayList<>(kontorahmen.values());
	}

	public Optional<Konto> findKontoByName(String name) {
		return Optional.ofNullable(kontorahmen.get(name));
	}

	public List<Buchung> findBuchungenByKontoname(String name) {
		return buchungen.stream()
				.filter( buchung -> enthaeltKonto(buchung, name))
				.collect(Collectors.toList());
	}
	
	private boolean enthaeltKonto(Buchung buchung, String kontoName) {
		return buchung.getUmsaetze().stream()
			.map( u -> u.getKonto())
			.findFirst()
			.isPresent();
	}

	public Set<Asset> getAssets() {
		return assets;
	}
}
