package de.tmosebach.slowen.backend.jpaadapter;

import static java.util.Objects.nonNull;

import java.time.LocalDate;
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
import de.tmosebach.slowen.backend.values.Betrag;
import de.tmosebach.slowen.backend.values.Kontorahmen;
import de.tmosebach.slowen.backend.values.Menge;

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

	private void skontroErtrag(Umsatz umsatz) {
		// TODO Zuordnung zwischen Skontro-Umsatz und Bestand
	}

	private void buchen(Buchung buchung) {
		buchung.getUmsaetze().stream().forEach( umsatz -> saldoAnpassen( umsatz ));
	}

	private boolean isSkontroUmsatz(Umsatz umsatz) {
		return nonNull(umsatz.getAsset());
	}

	private void skontroAbgang(Buchung buchung, Umsatz umsatz) {
		Optional<Konto> depotOptional = findKontoByName(umsatz.getKonto());
		Konto depot = depotOptional.get();
		String assetName = umsatz.getAsset();
		Bestand bestand = depot.getOrCreateBestand(assetName);

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
							Kontorahmen.Kursgewinn,
							umsatz.getValuta(),
							differenz.invert() ));
		} else if (differenz.isNegativ()) {
			saldoAnpassen(
					createUmsatz(
							Kontorahmen.Kursverlust,
							umsatz.getValuta(),
							differenz.invert() ));
		}
	}
	
	private Umsatz createUmsatz(Kontorahmen konto, LocalDate valuta, Betrag betrag) {
		Umsatz umsatz = new Umsatz();
		umsatz.setKonto(konto.name());
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
