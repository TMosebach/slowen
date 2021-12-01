package de.tmosebach.slowen.buchhaltung.model;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KontoRepository extends CrudRepository<Konto, Long> {

	public Optional<Konto> findByName(String kontoName);
}
