package de.tmosebach.slowen.backend.domain;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class KontoAnlegenTest {
	
	@Autowired
	private BuchhaltungService impl;

	@Test
	void test() {
		
		int count = impl.findKonten().size();
		
		Konto neuesKonto = new Konto();
		neuesKonto.setName("Neues Konto");
		
		Konto result = impl.kontoAnlegen(neuesKonto);
		
		assertNotNull(result);
		
		List<Konto> konten = impl.findKonten();
		assertTrue(konten.size() == count + 1);
		assertTrue(konten.contains(result));
	}
}
