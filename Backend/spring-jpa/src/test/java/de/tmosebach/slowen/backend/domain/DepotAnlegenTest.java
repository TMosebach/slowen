package de.tmosebach.slowen.backend.domain;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class DepotAnlegenTest {

	@Autowired
	private BuchhaltungServiceJpa impl;

	@Test
	void test() {
		
		int count = impl.findKonten().size();
		
		Depot neuesDepot = new Depot();
		neuesDepot.setName("Neues Depot");
		
		Depot result = impl.depotAnlegen(neuesDepot);
		
		assertNotNull(result);
		
		List<Konto> konten = impl.findKonten();
		assertTrue(konten.size() == count + 1);
		assertTrue(konten.contains(result));
	}
}
