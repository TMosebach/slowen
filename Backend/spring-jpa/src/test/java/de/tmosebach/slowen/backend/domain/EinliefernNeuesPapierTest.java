package de.tmosebach.slowen.backend.domain;

import static java.math.BigDecimal.valueOf;
import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class EinliefernNeuesPapierTest {

	@Autowired
	private BuchhaltungServiceJpa impl;
	
	@Test
	void testKauf() {
		Asset newAsset = new Asset();
		newAsset.setName("Telekom AG");
		final Asset asset = impl.assetAnlegen(newAsset);
		
		Depot neuDepot = new Depot();
		neuDepot.setName("Depot");
		final Depot depot = impl.depotAnlegen(neuDepot);

		Umsatz depotUmsatz = new Umsatz();
		depotUmsatz.setAsset(asset);
		depotUmsatz.setKonto(depot);
		depotUmsatz.setValuta(LocalDate.now());
		depotUmsatz.setBetrag(valueOf(1000.0));
		depotUmsatz.setMenge(valueOf(100.0));
		
		Buchung einlieferung = new Buchung();
		einlieferung.setArt(BuchungArt.Einlieferung);
		einlieferung.addUmsatz(depotUmsatz);

		impl.buchen(einlieferung);
		
		List<Konto> konten = impl.findKonten();
		Depot result = (Depot)konten.stream().filter( k -> (k instanceof Depot) ).findFirst().get();
		
		assertTrue(valueOf(1000.0).compareTo(result.getSaldo()) == 0);
		List<Bestand> bestaende = result.getBestaende();
		assertTrue(bestaende.size() > 0);
		Bestand bestand = bestaende.stream().filter( b -> b.getAsset().equals(asset)).findFirst().get();
		assertTrue(valueOf(1000.0).compareTo(bestand.getWert()) == 0);
		assertTrue(valueOf(100.0).compareTo(bestand.getMenge()) == 0);
	}
}
