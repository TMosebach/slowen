package de.tmosebach.slowen.backend.domain;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface KontoRepository extends JpaRepository<Konto, String> {

	Optional<Konto> findByName(String name);

}
