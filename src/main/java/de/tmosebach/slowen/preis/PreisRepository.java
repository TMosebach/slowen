package de.tmosebach.slowen.preis;

import java.time.LocalDate;
import java.util.Optional;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PreisRepository {
	
	void savePreis(Preis preis);
	Optional<Preis> getLetztenPreis(String referenz);
	Optional<Preis> getPreis(String referenz, LocalDate stichtag);
}
