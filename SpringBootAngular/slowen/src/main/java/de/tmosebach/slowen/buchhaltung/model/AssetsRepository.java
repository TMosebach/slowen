package de.tmosebach.slowen.buchhaltung.model;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetsRepository extends CrudRepository<Asset, Long>{

}
