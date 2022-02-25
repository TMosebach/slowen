package de.tmosebach.slowen.backend.jpaadapter;

import static java.util.Objects.nonNull;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import javax.validation.Validator;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import de.tmosebach.slowen.backend.domain.Asset;
import de.tmosebach.slowen.backend.domain.Bestand;
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
	private Map<String, Asset> assets = new HashMap<>();

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
        
        buchungen.add(buchung);
        buchungRepository.save(buchung);
        
		switch (buchung.getArt()) {
		case Buchung: 
			bucheBuchung(buchung);
			break;
		case Kauf:
			bucheKauf(buchung);
			break;
		default:
			throw new UnsupportedOperationException();
		}
		
		
		return buchung;
	}

	private void bucheBuchung(Buchung buchung) {
		buchung.getUmsaetze().stream().forEach( umsatz -> saldoAnpassen( umsatz ));
	}
	
	private void bucheKauf(Buchung buchung) {
		bucheBuchung(buchung);
		bucheSkonto(buchung);
	}

	private void bucheSkonto(Buchung buchung) {
		Optional<Umsatz> skontroUmsatz = 
				buchung.getUmsaetze().stream()
				.filter( umsatz -> nonNull(umsatz.getAsset()) )
				.findFirst();
		skontroUmsatz.ifPresentOrElse( 
				umsatz -> skontroAnpassen(umsatz), 
				() -> new IllegalArgumentException("Kein Bestands-Umsatz") );
	}

	/**
	 * Bestand im Depot anpassen.
	 * 
	 * Das Depot ist im Zweifel mit der Saldoanpassung entstanden.
	 * 
	 * @param umsatz
	 */
	private void skontroAnpassen(Umsatz umsatz) {
		Optional<Konto> depotOptional = findKontoByName(umsatz.getKonto());
		Konto depot = depotOptional.get();
		String assetName = umsatz.getAsset();
		Bestand bestand = depot.getOrCreateBestand(assetName);

		bestand.addMenge(umsatz.getMenge());
		bestand.addEinstandswert(umsatz.getBetrag());
	}

	private void saldoAnpassen(Umsatz umsatz) {
		Konto konto = getOrCreateKonto(umsatz.getKonto());
		konto.setSaldo( konto.getSaldo().add( umsatz.getBetrag() ));
	}
	
	private Konto getOrCreateKonto(String kontoName) {
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
		return assets.entrySet().stream()
				.map( entry -> entry.getValue() )
				.collect(Collectors.toSet());
	}
}
