package de.tmosebach.slowen.konten;

import java.util.List;
import java.util.Optional;

import org.apache.ibatis.annotations.Param;

import de.tmosebach.slowen.shared.values.KontoIdentifier;

public interface KontoRepository {

	void save(Konto konto);

	List<Konto> findKonten();

	Optional<Konto> findById(KontoIdentifier giro);

	void update(Konto konto);

	void merge(Bestand bestand);

	Optional<Konto> findByName(String name);

	List<Konto> findByFilter(
			@Param("name") String name,
			@Param("bilanzType") BilanzType bilanzType);
}
