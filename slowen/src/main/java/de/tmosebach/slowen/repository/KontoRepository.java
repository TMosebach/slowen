package de.tmosebach.slowen.repository;

import org.springframework.data.repository.CrudRepository;

import de.tmosebach.slowen.model.Konto;

public interface KontoRepository extends CrudRepository<Konto, Long> {

}
