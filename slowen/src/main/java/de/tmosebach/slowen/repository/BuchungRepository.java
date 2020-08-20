package de.tmosebach.slowen.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import de.tmosebach.slowen.model.Buchung;

public interface BuchungRepository extends CrudRepository<Buchung, Long> {
	@Query("select b from Buchung b join b.umsaetze u where u.konto.name = :kontoName order by u.valuta asc ")
	Page<Buchung> findByKonto(String kontoName, Pageable pageable );
}
