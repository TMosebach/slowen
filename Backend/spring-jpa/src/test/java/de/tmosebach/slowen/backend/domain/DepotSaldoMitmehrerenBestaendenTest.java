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
public class DepotSaldoMitmehrerenBestaendenTest {
	
	@Autowired
	private BuchhaltungServiceJpa impl;
	
	@Test
	void testKauf() {
		Asset newAsset = new Asset();
		newAsset.setName("Telekom AG");
		final Asset asset1 = impl.assetAnlegen(newAsset);
		
		Depot neuDepot = new Depot();
		neuDepot.setName("Depot");
		final Depot depot = (Depot)impl.kontoAnlegen(neuDepot);

		Konto giro = new Konto();
		giro.setName("Giro");
		giro = impl.kontoAnlegen(giro);

		HandelGenerator generator = new HandelGenerator(asset1, depot, giro);
		Buchung kauf1 = generator.erzeugeHandel(BuchungArt.Kauf, valueOf(100.0), valueOf(1500.0));

		impl.buchen(kauf1);
		//
		
		Asset newAsset2 = new Asset();
		newAsset2.setName("Telekom AG");
		final Asset asset2 = impl.assetAnlegen(newAsset2);
		
		generator = new HandelGenerator(asset2, depot, giro);
		Buchung kauf2 = generator.erzeugeHandel(BuchungArt.Kauf, valueOf(50.0), valueOf(2000.0));

		impl.buchen(kauf2);
		
		//
		
		List<Konto> konten = impl.findKonten();
		Depot result = (Depot)konten.stream().filter( k -> (k instanceof Depot) ).findFirst().get();
		
		assertTrue(valueOf(3500.0).compareTo(result.getSaldo()) == 0);
		List<Bestand> bestaende = result.getBestaende();
		assertTrue(bestaende.size() > 0);
		
		Bestand bestand1 = bestaende.stream().filter( b -> b.getAsset().equals(asset1)).findFirst().get();
		assertTrue(valueOf(1500.0).compareTo(bestand1.getWert()) == 0);
		assertTrue(valueOf(100.0).compareTo(bestand1.getMenge()) == 0);
		
		Bestand bestand2 = bestaende.stream().filter( b -> b.getAsset().equals(asset2)).findFirst().get();
		assertTrue(valueOf(2000.0).compareTo(bestand2.getWert()) == 0);
		assertTrue(valueOf(50.0).compareTo(bestand2.getMenge()) == 0);
	}
}
