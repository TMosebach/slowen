package de.tmosebach.slowen.backend.domain;

import java.util.List;

import org.springframework.data.domain.Page;

public interface BuchhaltungService {

	Buchung buche(Buchung apiBuchung2Buchung);

	Page<Buchung> findBuchungenByKonto(Long id, int page, int size);

	List<Konto> getKontorahmen();

	List<Asset> getAssets();

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

	Konto createKonto(Konto konto);

	Asset createAsset(Asset asset);
}