package de.tmosebach.slowen.backend.domain;

import java.util.List;

import org.springframework.data.domain.Page;

public interface BuchhaltungService {

	List<Konto> findKonten();

	Konto kontoAnlegen(Konto konto);

	Depot depotAnlegen(Depot depot);

	Buchung buchen(Buchung buchung);

	Buchung kauf(Buchung buchung);

	Buchung verkauf(Buchung buchung);

	Buchung ertrag(Buchung buchung);

	Page<Buchung> findBuchungenByKonto(Long id, int number, int size);

	Asset neuesAsset(Asset asset);

	List<Asset> findAssets();

	Buchung einlieferung(Buchung buchung);

}