package de.tmosebach.slowen.backend.domain;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class ErtragTest {

	@Autowired
	private BuchhaltungServiceJpa impl;
	
	@Test
	void testDividendenzahlung() {
		Asset newAsset = new Asset();
		newAsset.setName("Telekom AG");
		final Asset asset = impl.assetAnlegen(newAsset);
		
		Konto dividente = new Konto();
		dividente.setName(KontoFactory.DIVIDENDE);
		dividente = impl.kontoAnlegen(dividente);
		
		Umsatz dividendenUmsatz = new Umsatz();
		dividendenUmsatz.setKonto(dividente);
		dividendenUmsatz.setAsset(asset);
		dividendenUmsatz.setValuta(LocalDate.now());
		dividendenUmsatz.setBetrag(BigDecimal.TEN.negate());

		Konto giro = new Konto();
		giro.setName("Giro");
		giro = impl.kontoAnlegen(giro);
		
		Umsatz giroUmsatz = new Umsatz();
		giroUmsatz.setKonto(giro);
		giroUmsatz.setValuta(LocalDate.now());
		giroUmsatz.setBetrag(BigDecimal.TEN);

		Buchung ertrag = new Buchung();
		ertrag.setArt(BuchungArt.Ertrag);
		ertrag.setVerwendung("Dividendenzahlung");
		ertrag.addUmsatz(giroUmsatz);
		ertrag.addUmsatz(dividendenUmsatz);

		impl.buchen(ertrag);
		
		List<Konto> konten = impl.findKonten();
		Konto result = konten.stream().filter( k -> k.getName().equals(KontoFactory.DIVIDENDE)).findFirst().get();
		assertTrue(BigDecimal.TEN.negate().compareTo(result.getSaldo()) == 0);
	}
}