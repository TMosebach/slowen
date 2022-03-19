package de.tmosebach.slowen.backend.domain;

import java.util.List;
import java.util.Set;

public interface BuchhaltungService {

	Buchung buche(Buchung apiBuchung2Buchung);

	List<Buchung> findBuchungenByKontoname(String name);

	List<Konto> getKontorahmen();

	Set<Asset> getAssets();
}