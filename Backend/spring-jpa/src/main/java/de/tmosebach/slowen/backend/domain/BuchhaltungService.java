package de.tmosebach.slowen.backend.domain;

import java.util.List;

import org.springframework.data.domain.Page;

public interface BuchhaltungService {

	List<Konto> findKonten();

	Konto kontoAnlegen(Konto konto);

	Buchung buchen(Buchung buchung);

	Page<Buchung> findBuchungenByKonto(Long id, int number, int size);

	Asset assetAnlegen(Asset asset);

	List<Asset> findAssets();
}