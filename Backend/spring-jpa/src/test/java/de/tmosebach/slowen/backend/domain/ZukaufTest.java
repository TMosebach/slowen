package de.tmosebach.slowen.backend.domain;

import static java.math.BigDecimal.valueOf;
import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class ZukaufTest {

	@Autowired
	private BuchhaltungServiceJpa impl;
	
	@Test
	void testZukauf() {
		Asset newAsset = new Asset();
		newAsset.setName("Telekom AG");
		final Asset asset = impl.assetAnlegen(newAsset);
		
		Depot neuDepot = new Depot();
		neuDepot.setName("Depot");
		final Depot depot = (Depot)impl.kontoAnlegen(neuDepot);

		Konto giro = new Konto();
		giro.setName("Giro");
		giro = impl.kontoAnlegen(giro);

		HandelGenerator generator = new HandelGenerator(asset, depot, giro);
		Buchung kauf = generator.erzeugeHandel(BuchungArt.Kauf, valueOf(100.0), valueOf(1500.0));

		impl.buchen(kauf);
		
		Buchung zukauf = generator.erzeugeHandel(BuchungArt.Kauf, valueOf(50.0), valueOf(753.77));
		impl.buchen(zukauf);
		
		List<Konto> konten = impl.findKonten();
		Depot result = (Depot)konten.stream().filter( k -> (k instanceof Depot) ).findFirst().get();
		
		assertTrue(valueOf(2253.77).compareTo(result.getSaldo()) == 0);
		List<Bestand> bestaende = result.getBestaende();
		assertTrue(bestaende.size() > 0);
		Bestand bestand = bestaende.stream().filter( b -> b.getAsset().equals(asset)).findFirst().get();
		assertTrue(valueOf(2253.77).compareTo(bestand.getWert()) == 0);
		assertTrue(valueOf(150.0).compareTo(bestand.getMenge()) == 0);
	}
}
