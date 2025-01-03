package de.tmosebach.slowen.api;

import static de.tmosebach.slowen.domain.Kontonamen.*;
import static de.tmosebach.slowen.values.KontoArt.Depot;
import static de.tmosebach.slowen.values.KontoArt.Konto;
import static java.math.BigDecimal.valueOf;
import static java.time.LocalDate.of;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.jdbc.Sql;

import de.tmosebach.slowen.DataInitializer;
import de.tmosebach.slowen.api.input.Verkauf;
import de.tmosebach.slowen.domain.Bestand;
import de.tmosebach.slowen.domain.DepotBestand;
import de.tmosebach.slowen.domain.Konto;
import de.tmosebach.slowen.domain.KontoBestand;
import de.tmosebach.slowen.domain.KontoService;
import de.tmosebach.slowen.values.KontoArt;

@SpringBootTest
@Sql({"clearDB.sql"})
class VerkaufTest {
	
	private static final LocalDate DATUM = of(2024, 8, 31);
	private static final String DEPOT = "Depot";
	private static final String KONTO = "Konto";
	private static final String ISIN = "DE000801108150";
	private static final LocalDate VALUTA = of(2024, 9, 2);
	
	@MockitoBean // Datainitializer für Test kalt stellen.
	private DataInitializer dataInitializer;

	@Autowired
	private KontoService kontoService;
	
	@Autowired
	private MutationController impl;

	@Test
	void testVerkauf() {
		
		createKonto("Konto", Konto);
		createKonto(KEST, Konto);
		createKonto(SOLI, Konto);
		createKonto("Depot", Depot);
		createKonto(PROVISION, Konto);
		createKonto(KURSGEWINN, Konto);
		
		Bestand target = new Bestand();
		target.setAsset(ISIN);
		target.setEinstand(valueOf(1980));
		target.setMenge(valueOf(2000));
		DepotBestand depotBestand = kontoService.findDepotBestandByName("Depot");
		depotBestand.add(target);
		
		Verkauf verkauf = new Verkauf();
		verkauf.setDatum(DATUM);
		verkauf.setDepot(DEPOT);
		verkauf.setAsset(ISIN);
		verkauf.setMenge(valueOf(1000));
		verkauf.setKonto(KONTO);
		verkauf.setValuta(VALUTA);
		verkauf.setProvision(valueOf(20));
		verkauf.setKest(valueOf(10));
		verkauf.setSoli(valueOf(5));
		verkauf.setBetrag(valueOf(1055));
		
		impl.verkaufe(verkauf);
		
		List<Bestand> bestaende = depotBestand.getBestaende();
		assertEquals(1, bestaende.size());
		
		Bestand bestand = bestaende.get(0);
		assertEquals(ISIN, bestand.getAsset());
		assertEquals(0, valueOf(1000).compareTo(bestand.getMenge()));
		assertTrue(valueOf(990).compareTo(bestand.getEinstand()) == 0);

		assertKonto(valueOf(1020.0), "Konto");
		assertKonto(valueOf(20.0), PROVISION);
		assertKonto(valueOf(10.0), KEST);
		assertKonto(valueOf(5.0), SOLI);
		assertKonto(valueOf(-30.0), KURSGEWINN);
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
