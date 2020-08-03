package de.tmosebach.slowen.repository;

import org.springframework.data.repository.CrudRepository;

import de.tmosebach.slowen.model.Buchung;

public interface BuchungRepository extends CrudRepository<Buchung, Long> {

}
