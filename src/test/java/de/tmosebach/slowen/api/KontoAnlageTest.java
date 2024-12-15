package de.tmosebach.slowen.api;

import static org.junit.jupiter.api.Assertions.*;

import java.util.NoSuchElementException;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;

import de.tmosebach.slowen.api.input.KontoInput;
import de.tmosebach.slowen.values.BilanzPosition;
import de.tmosebach.slowen.values.KontoArt;

@SpringBootTest
@Sql({"clearDB.sql"})
class KontoAnlageTest {

	@Autowired
	private MutationController impl;
	
	@Autowired
	private QueryController queryController;
	
	@Test
	void testKontoanlage() {
		assertThrows(NoSuchElementException.class, 
				() -> queryController.findKontoByName("MeinKonto"));
		
		KontoInput kontoInput = new KontoInput();
		kontoInput.setName("MeinKonto");
		kontoInput.setArt(KontoArt.Konto);
		kontoInput.setBilanzPosition(BilanzPosition.Kontokorrent);
		kontoInput.setWaehrung("EUR");
		
		impl.neuesKonto(kontoInput);
		
		assertNotNull(queryController.findKontoByName("MeinKonto"));
	}
	
	@Test
	void testDepotanlage() {
		assertThrows(NoSuchElementException.class, 
				() -> queryController.findKontoByName("MeinDepot"));
		
		KontoInput kontoInput = new KontoInput();
		kontoInput.setName("MeinDepot");
		kontoInput.setArt(KontoArt.Depot);
		
		impl.neuesKonto(kontoInput);
		
		assertNotNull(queryController.findKontoByName("MeinDepot"));
	}
}
