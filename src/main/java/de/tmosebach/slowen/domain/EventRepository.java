package de.tmosebach.slowen.domain;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface EventRepository {

	void saveKontoanlage(Konto konto);

	void saveBuchung(Buchung buchung);

	void saveKontoUmsatz(KontoUmsatz umsatz);

	void saveAsset(Asset asset);

	void saveDepotUmsatz(DepotUmsatz umsatz);

	List<Konto> getKonten();

	List<Asset> getAssets();

	List<Buchung> getBuchungen();
}
