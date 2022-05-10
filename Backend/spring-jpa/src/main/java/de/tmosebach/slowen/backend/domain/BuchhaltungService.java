package de.tmosebach.slowen.backend.domain;

import java.util.List;
import java.util.Set;

public interface BuchhaltungService {

	Buchung buche(Buchung apiBuchung2Buchung);

	List<Buchung> findBuchungenByKonto(Long id, Long page, Long size);

	List<Konto> getKontorahmen();

	Set<Asset> getAssets();

	Konto getKontoById(Long id);
	
	/**
	 * Suchen nach Buchungen, deren Verwendung oder Empfänger mit
	 * dem Query-Pattern starten.
	 * 
	 * @param query Das Pattern
	 * @return Liste der gefundenen Buchungen.
	 */
	List<Buchung> searchBuchungen(String query);

	long countBuchungenByKonto(Long kontoId);
}