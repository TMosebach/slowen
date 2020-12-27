package de.tmosebach.slowen.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

import de.tmosebach.slowen.model.Asset;

public interface AssetRepository extends CrudRepository<Asset, Long>{
	
	List<Asset> findByNameStartsWith(String namePattern);

}
