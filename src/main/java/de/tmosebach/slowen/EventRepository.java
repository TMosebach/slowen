package de.tmosebach.slowen;

import org.apache.ibatis.annotations.Mapper;

import de.tmosebach.slowen.api.types.Konto;

@Mapper
public interface EventRepository {

	void saveKontoanlage(Konto konto);

}
