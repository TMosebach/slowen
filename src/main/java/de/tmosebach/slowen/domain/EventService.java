package de.tmosebach.slowen.domain;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import de.tmosebach.slowen.values.KontoArt;

@Service
public class EventService {
	
	private EventRepository eventRepository;

	public EventService(EventRepository eventRepository) {
		this.eventRepository = eventRepository;
	}

	@Transactional
	public void saveKontoanlage(Konto konto) {
		eventRepository.saveKontoanlage(konto);
	}

	@Transactional
	public void saveBuchung(Buchung result) {
		eventRepository.saveBuchung(result);
		result.getUmsaetze().forEach( umsatz -> {
			if (umsatz.getArt() == KontoArt.Konto) {
				eventRepository.saveKontoUmsatz((KontoUmsatz)umsatz);
			} else {
				eventRepository.saveDepotUmsatz((DepotUmsatz)umsatz);
			}
		});
	}

	@Transactional
	public void saveAsset(Asset asset) {
		eventRepository.saveAsset(asset);
	}

}
