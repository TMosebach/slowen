package de.tmosebach.slowen.backend.domain;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long>{

	Optional<Asset> findByName(String name);
}
