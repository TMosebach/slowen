package de.tmosebach.slowen.api;

import static de.tmosebach.slowen.values.KontoArt.Depot;
import static de.tmosebach.slowen.values.KontoArt.Konto;
import static java.math.BigDecimal.valueOf;
import static java.time.LocalDate.of;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;

import de.tmosebach.slowen.api.input.Kauf;
import de.tmosebach.slowen.domain.Bestand;
import de.tmosebach.slowen.domain.DepotBestand;
import de.tmosebach.slowen.domain.Konto;
import de.tmosebach.slowen.domain.KontoBestand;
import de.tmosebach.slowen.domain.KontoService;
import de.tmosebach.slowen.values.KontoArt;

@SpringBootTest
class KaufApiTest {
	
	private static final String ISIN = "DE000801108150";
	private static final String DEPOT = "Depot";
	private static final String KONTO = "Konto";
	private static final LocalDate DATUM = of(2024, 12, 2);
	private static final LocalDate VALUTA = of(2024, 12, 4);

	@Autowired
	private KontoService kontoService;
	
	@Autowired
	private MutationController impl;

	@Test
	@Sql({"clearDB.sql", "testKonten.sql"})
	void testKauf() {
		
		createKonto("Konto", Konto);
		createKonto("Stückzins", Konto);
		createKonto("Provision", Konto);
		createKonto("Depot", Depot);
		
		Kauf kauf = new Kauf();
		kauf.setDatum(DATUM);
		kauf.setDepot(DEPOT);
		kauf.setAsset(ISIN);
		kauf.setMenge(valueOf(1000));
		kauf.setBetrag(valueOf(990));
		kauf.setKonto(KONTO);
		kauf.setValuta(VALUTA);
		kauf.setProvision(valueOf(20));
		kauf.setStueckzins(valueOf(5));
		
		impl.kaufe(kauf);
		
		DepotBestand depotBestand = kontoService.findDepotBestandByName("Depot");
		
		List<Bestand> bestaende = depotBestand.getBestaende();
		assertEquals(1, bestaende.size());

		Bestand bestand = bestaende.get(0);
		assertEquals(ISIN, bestand.getAsset());
		assertEquals(0, valueOf(1000).compareTo(bestand.getMenge()));
		assertEquals(valueOf(990), bestand.getEinstand());

		assertKonto(valueOf(-1015.0), "Konto");
		assertKonto(valueOf(5.0), "Stückzins");
		assertKonto(valueOf(20.0), "Provision");	
	}

	private void createKonto(String kontoName, KontoArt art) {
		Konto konto = new Konto();
		konto.setName(kontoName);
		konto.setArt(art);
		kontoService.neuesKonto(konto);
	}

	private void assertKonto(BigDecimal erwarteterSaldo, String kontoName) {
		KontoBestand konto = kontoService.findKontoBestandByName(kontoName);
		assertEquals(0, erwarteterSaldo.compareTo(konto.getSaldo()), " Saldo ist "+konto.getSaldo()+ " statt "+erwarteterSaldo);
	}
}
