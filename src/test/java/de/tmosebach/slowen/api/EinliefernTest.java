package de.tmosebach.slowen.api;

import static java.math.BigDecimal.valueOf;
import static java.time.LocalDate.of;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;

import de.tmosebach.slowen.api.input.Einlieferung;
import de.tmosebach.slowen.domain.Bestand;
import de.tmosebach.slowen.domain.DepotBestand;
import de.tmosebach.slowen.domain.Konto;
import de.tmosebach.slowen.domain.KontoService;

@SpringBootTest
@Sql({"clearDB.sql"})
class EinliefernTest {
	
	private static final String ISIN = "DE0008032001";
	private static final String DEPOT = "Depot";
	private static final LocalDate DATUM = of(2024, 8, 31);
	private static final LocalDate VALUTA = of(2024, 9, 2);

	@Autowired
	private KontoService kontoService;
	
	@Autowired
	private MutationController impl;

	@Test
	void testEinlieferung() {
		
		Konto depot = new Konto();
		depot.setName(DEPOT);
		kontoService.neuesKonto(depot);
		
		Einlieferung einlieferung = new Einlieferung();
		einlieferung.setDatum(DATUM);
		einlieferung.setDepot(DEPOT);
		einlieferung.setAsset(ISIN);
		einlieferung.setMenge(valueOf(200));
		einlieferung.setBetrag(valueOf(50.22));
		einlieferung.setValuta(VALUTA);
		
		impl.liefereEin(einlieferung);
		
		DepotBestand depotBestand = kontoService.findDepotBestandByName("Depot");
		
		List<Bestand> bestaende = depotBestand.getBestaende();
		assertEquals(1, bestaende.size());

		Bestand bestand = bestaende.get(0);
		assertEquals(ISIN, bestand.getAsset());
		assertEquals(0, valueOf(200).compareTo(bestand.getMenge()));
		assertEquals(valueOf(50.22), bestand.getEinstand());
	}
}
