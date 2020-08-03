package de.tmosebach.slowen.service;

import static java.util.Objects.isNull;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.stereotype.Service;

import de.tmosebach.slowen.exception.IllegalDataException;
import de.tmosebach.slowen.exception.UnkownEntityException;
import de.tmosebach.slowen.model.Buchung;
import de.tmosebach.slowen.model.Konto;
import de.tmosebach.slowen.model.KontoUmsatz;
import de.tmosebach.slowen.repository.BuchungRepository;
import de.tmosebach.slowen.repository.KontoRepository;

@Service
public class BuchungService {
	
	private KontoRepository kontoRepository;
	private BuchungRepository buchungRepository;

	public BuchungService(KontoRepository kontoRepository, BuchungRepository buchungRepository) {
		this.kontoRepository = kontoRepository;
		this.buchungRepository = buchungRepository;
	}

	public Buchung buche(Buchung template) throws UnkownEntityException, IllegalDataException {
		
		Buchung buchung = new Buchung();
// FIXME		buchung.setVorgang(template.getVorgang());
		buchung.setEmpfaenger(template.getEmpfaenger());
		buchung.setVerwendung(template.getVerwendung());
		
		for (KontoUmsatz umsatz : template.getUmsaetze()) {
			verarbeiteUmsatz(buchung, umsatz); 
		}

		buchungRepository.save(buchung);
		
		return buchung;
	}
	
	private void verarbeiteUmsatz(Buchung buchung, KontoUmsatz u) throws UnkownEntityException, IllegalDataException {
		buchung.addKontoUmsatz(u);
		
		Konto konto = assoziereKonto(u);
		checkAndSetValuta(u);

		kontoRepository.save(konto);
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
	
	private Konto assoziereKonto(KontoUmsatz u) throws UnkownEntityException {
		Konto template = u.getKonto();
		
		Optional<Konto> konto = kontoRepository.findByName(template.getName());
		if(konto.isEmpty()) {
			throw new UnkownEntityException("Kein Konto zu den Angaben ", template); 
		}
		
		Konto result = konto.get();
		result.addKontoUmsatz(u);
		return result;
	}
}
