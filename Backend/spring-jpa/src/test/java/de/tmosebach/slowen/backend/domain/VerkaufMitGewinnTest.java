package de.tmosebach.slowen.backend.domain;

import static de.tmosebach.slowen.backend.domain.KontoFactory.*;
import static java.math.BigDecimal.valueOf;
import static java.math.BigDecimal.ZERO;
import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class VerkaufMitGewinnTest {
	
	@Autowired
	private BuchhaltungServiceJpa impl;
	
	@Test
	void testVerkauf_mit_Gewinn() {
		Asset newAsset = new Asset();
		newAsset.setName("Telekom AG");
		final Asset asset = impl.neuesAsset(newAsset);
		
		Depot neuDepot = new Depot();
		neuDepot.setName("Depot");
		final Depot depot = impl.depotAnlegen(neuDepot);

		Konto giro = new Konto();
		giro.setName("Giro");
		giro = impl.kontoAnlegen(giro);

		HandelGenerator generator = new HandelGenerator(asset, depot, giro);
		Buchung kauf = generator.erzeugeHandel("Kauf", valueOf(100.0), valueOf(1500.0));

		impl.kauf(kauf);
		
		Buchung verkauf = generator.erzeugeHandel("Verkauf", valueOf(-100.0), valueOf(-2000.0));
		impl.verkauf(verkauf);
		
		List<Konto> konten = impl.findKonten();
		Depot result = (Depot)konten.stream().filter( k -> (k instanceof Depot) ).findFirst().get();
		
		assertTrue(ZERO.compareTo(result.getSaldo()) == 0);
		List<Bestand> bestaende = result.getBestaende();
		assertTrue(bestaende.size() > 0);
		Bestand bestand = bestaende.stream().filter( b -> b.getAsset().equals(asset)).findFirst().get();
		assertTrue(ZERO.compareTo(bestand.getWert()) == 0);
		assertTrue(ZERO.compareTo(bestand.getMenge()) == 0);
		
		Konto kursGewinn = 
				konten.stream()
				.filter( k -> k.getName().equals(KURS_GEWINN) )
				.findFirst().get();
		assertTrue(valueOf(-500.0).compareTo(kursGewinn.getSaldo()) == 0);
	}
}
