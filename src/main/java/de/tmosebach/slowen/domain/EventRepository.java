package de.tmosebach.slowen.domain;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface EventRepository {

	void saveKontoanlage(Konto konto);

	void saveBuchung(Buchung buchung);

	void saveKontoUmsatz(KontoUmsatz umsatz);
}
