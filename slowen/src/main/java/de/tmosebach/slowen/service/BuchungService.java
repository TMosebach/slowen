package de.tmosebach.slowen.service;

import static java.util.Objects.isNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

	public BuchungService(
			KontoRepository kontoRepository,
			BuchungRepository buchungRepository) {
		this.kontoRepository = kontoRepository;
		this.buchungRepository = buchungRepository;
	}

	@Transactional
	public Buchung buche(Buchung template) throws UnkownEntityException, IllegalDataException {
		
		Buchung buchung = new Buchung();
		buchung.setEmpfaenger(template.getEmpfaenger());
		buchung.setVerwendung(template.getVerwendung());
		
		for (KontoUmsatz umsatz : template.getUmsaetze()) {
			verarbeiteUmsatz(buchung, umsatz); 
		}

		buchungRepository.save(buchung);
		
		return buchung;
	}
	
	/**
	 * Einer Buchung einen neuen Umsatz hinzufügen und im Konto verbuchen.
	 * 
	 * @param buchung
	 * @param umsatz
	 * @throws UnkownEntityException Refernziertes Konto wurde nicht gefunden.
	 * @throws IllegalDataException
	 */
	private void verarbeiteUmsatz(Buchung buchung, KontoUmsatz umsatz) throws UnkownEntityException, IllegalDataException {

		Konto konto = assoziereKonto(umsatz);
		buchung.addKontoUmsatz(umsatz);
		checkAndSetValuta(umsatz);

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
	
	/**
	 * Konto zu Umsatz finden, Relation aufbauen und Saldo anpassen.
	 * 
	 * @param u
	 * @return
	 * @throws UnkownEntityException Refernziertes Konto wurde nicht gefunden.
	 */
	private Konto assoziereKonto(KontoUmsatz u) throws UnkownEntityException {

		Optional<Konto> konto = kontoRepository.findByName(u.getKontoName());
		Konto result = konto.orElseThrow(() -> new UnkownEntityException("Kein Konto zu den Angaben ", u.getKontoName()));
		result.addKontoUmsatz(u);
		return result;
	}

	public Page<Buchung> findByKonto(String name, Pageable pageable) {
		return buchungRepository.findByKonto(name, pageable);
	}

	public Buchung findById(Long id) throws UnkownEntityException {
		Optional<Buchung> buchung = buchungRepository.findById(id);
		return buchung.orElseThrow(() -> new UnkownEntityException("Keine Buchung mit ID ", id));
	}

	/**
	 * Update einer Buchung.
	 * <p>
	 * Um komplizierte Vergleiche zu vermeiden, werden die ursprünglichen Umsätze 
	 * pauschal gelöscht und die neuen anschließend eingefügt.
	 * 
	 * @param buchung
	 * @throws UnkownEntityException Refernziertes Konto wurde nicht gefunden.
	 * @throws IllegalDataException 
	 */
	@Transactional
	public void update(Buchung buchung) throws UnkownEntityException, IllegalDataException {
		
		
		Optional<Buchung> originOptional = buchungRepository.findById(buchung.getId());
		if (originOptional.isPresent()) {
			Buchung origin = originOptional.get();
			origin.setEmpfaenger(buchung.getEmpfaenger());
			origin.setVerwendung(buchung.getVerwendung());

			updateUmsaetze(origin, buchung);

			buchungRepository.save(origin);
		}
	}

	/**
	 * Überträgt die Umsätze der geänderten Buchung in die original vorhandene.
	 * 
	 * @param origin
	 * @param buchung
	 * @throws IllegalDataException 
	 * @throws UnkownEntityException Refernziertes Konto wurde nicht gefunden.
	 */
	private void updateUmsaetze(Buchung origin, Buchung buchung) throws UnkownEntityException, IllegalDataException {
		List<KontoUmsatz> zuLoeschendeUmsaetze = new ArrayList<>(origin.getUmsaetze());
		
		// create bzw. update von Umsätzen
		for (KontoUmsatz umsatz : buchung.getUmsaetze()) {
			if (zuAktualisieren(umsatz, origin)) {
				updateUmsatz(origin, umsatz);
				entferne(zuLoeschendeUmsaetze, umsatz);
			} else {
				verarbeiteUmsatz(origin, umsatz);
			}
		}
		
		// löschen nicht mehr benötigter Umsätze
		for (KontoUmsatz umsatz : zuLoeschendeUmsaetze) {
			deleteUmsatz(origin, umsatz);
		}
	}

	/**
	 * Entfernen eines vorhandenen Umsatzes von einer Buchung.
	 * <p>
	 * Dazu ist der Umsatz aus der Buchung und dem Konto zu entfernen, 
	 * wobei der Saldo des Kontos entsprechend anzupassen ist.
	 * 
	 * @param origin Die Buchung
	 * @param umsatz Der zu entfernende Umsatz.
	 */
	private void deleteUmsatz(Buchung origin, KontoUmsatz umsatz) {
		KontoUmsatz zuLoeschenderUmsatz = 
				findKontoUmsatzByKontoName(origin, umsatz)
				.get();
		
		Optional<Konto> optionalKonto = kontoRepository.findByName(umsatz.getKontoName());
		Konto konto = 
				optionalKonto.orElseThrow(
						() -> new IllegalStateException("Konto nicht gefunden: "+umsatz.getKontoName()));
		konto.getUmsaetze().remove(zuLoeschenderUmsatz);
		konto.setSaldo(konto.getSaldo().subtract(umsatz.getBetrag()));
		kontoRepository.save(konto);

		origin.getUmsaetze().remove(zuLoeschenderUmsatz);
	}

	/**
	 * Ein nicht mehr zu löschender Umsatz ist aus der Merkerliste zu entfernen.
	 * <p>
	 * Das Merkmal, um einen zu löschenden Umsatz zu erkennen ist der Konto-Name.
	 * 
	 * @param zuLoeschendeUmsaetze Die Merkerliste
	 * @param umsatz Der zu entfernende Umsatz
	 */
	private void entferne(List<KontoUmsatz> zuLoeschendeUmsaetze, KontoUmsatz umsatz) {
		KontoUmsatz zuLoeschen = 
				zuLoeschendeUmsaetze.stream()
				.filter( u -> u.getKontoName().equals(umsatz.getKontoName()))
				.findFirst()
				.get();
		zuLoeschendeUmsaetze.remove(zuLoeschen);
	}

	/**
	 * Der Umsatz einer Originalbuchung übernimmt die neuen Umsatzdaten und passt den Kontosaldo an.
	 * 
	 * @param origin Buchung mit den originalen Umsätzen
	 * @param umsatz Umsatz mit den aktualisierten Daten.
	 */
	private void updateUmsatz(Buchung buchung, KontoUmsatz umsatz) {
		Optional<KontoUmsatz> optionalOrigin = findKontoUmsatzByKontoName(buchung, umsatz);

		KontoUmsatz origin = optionalOrigin.orElseThrow(
				() -> new IllegalStateException(
						"Unbekannter Umsatz an Buchung "+buchung.getId()+" für Konto "+umsatz.getKontoName()));
		BigDecimal saldoDiff = umsatz.getBetrag().subtract(origin.getBetrag());
		origin.setBetrag(umsatz.getBetrag());
		origin.setValuta(umsatz.getValuta());
		
		Optional<Konto> optionalKonto = kontoRepository.findByName(umsatz.getKontoName());
		
		if (optionalKonto.isEmpty()) {
			throw new IllegalStateException();
		}
		
		Konto konto = optionalKonto.orElseThrow(
				() -> new IllegalStateException("Unbekanntes Konto "+umsatz.getKontoName()));
		konto.setSaldo(konto.getSaldo().add(saldoDiff));
		kontoRepository.save(konto);
	}

	/**
	 * Ist der Umsatz fachlich in der aktuellen Buchung enthalten?
	 * 
	 * @param umsatz Der zu vergleichende Umsatz
	 * @param origin Die Buchung mit den vorhandenen Umsätzen.
	 * @return {@code true}, falls {@code umsatz} in denen von {@code origin} enthalten ist.
	 */
	private boolean zuAktualisieren(KontoUmsatz umsatz, Buchung origin) {
		return findKontoUmsatzByKontoName(origin, umsatz).isPresent();
	}
	
	private Optional<KontoUmsatz> findKontoUmsatzByKontoName(Buchung buchung, KontoUmsatz zielUmsatz) {
		List<KontoUmsatz> quelle = buchung.getUmsaetze();
		return quelle.stream()
				.filter(umsatz -> zielUmsatz.getKontoName().equals(umsatz.getKontoName()) )
				.findFirst();
	}
}
