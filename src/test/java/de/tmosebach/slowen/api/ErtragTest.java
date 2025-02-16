package de.tmosebach.slowen.api;

import static de.tmosebach.slowen.domain.Kontonamen.KEST;
import static de.tmosebach.slowen.domain.Kontonamen.SOLI;
import static de.tmosebach.slowen.domain.Kontonamen.ZINSKUPON;
import static de.tmosebach.slowen.values.KontoArt.Depot;
import static de.tmosebach.slowen.values.KontoArt.Konto;
import static java.math.BigDecimal.valueOf;
import static java.time.LocalDate.of;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.jdbc.Sql;

import de.tmosebach.slowen.DataInitializer;
import de.tmosebach.slowen.api.input.Ertrag;
import de.tmosebach.slowen.api.input.Ertragsart;
import de.tmosebach.slowen.domain.Bestand;
import de.tmosebach.slowen.domain.DepotBestand;
import de.tmosebach.slowen.domain.Konto;
import de.tmosebach.slowen.domain.KontoBestand;
import de.tmosebach.slowen.domain.KontoService;
import de.tmosebach.slowen.values.KontoArt;

@SpringBootTest
@Sql({"clearDB.sql"})
class ErtragTest {
	
	private static final String ISIN = "DE000801108150";
	private static final String DEPOT = "Depot";
	private static final String KONTO = "Konto";
	private static final LocalDate DATUM = of(2024, 12, 2);
	private static final LocalDate VALUTA = of(2024, 12, 4);

	@MockitoBean // Datainitializer für Test kalt stellen.
	private DataInitializer dataInitializer;
	
	@Autowired
	private KontoService kontoService;

	@Autowired
	private MutationController impl;

	@Test
	void testErtrag() {
		
		createKonto(KONTO, Konto);
		createKonto(KEST, Konto);
		createKonto(SOLI, Konto);
		createKonto(DEPOT, Depot);
		createKonto(ZINSKUPON, Konto);
		
		Bestand target = new Bestand();
		target.setAsset(ISIN);
		target.setEinstand(valueOf(1980));
		target.setMenge(valueOf(2000));
		DepotBestand depotBestand = kontoService.findDepotBestandByName("Depot");
		depotBestand.add(target);
		
		Ertrag ertrag = new Ertrag();
		ertrag.setDatum(DATUM);
		ertrag.setDepot(DEPOT);
		ertrag.setAsset(ISIN);
		ertrag.setErtragsart(Ertragsart.Zins);
		ertrag.setKonto(KONTO);
		ertrag.setValuta(VALUTA);
		ertrag.setBetrag(valueOf(146.0));
		ertrag.setKest(valueOf(50.0));
		ertrag.setSoli(valueOf(4.0));

		impl.bucheErtrag(ertrag);

		assertKonto(valueOf(146.0), KONTO);
		assertKonto(valueOf(50.0), KEST);
		assertKonto(valueOf(4.0), SOLI);
		assertKonto(valueOf(-200.0), ZINSKUPON);
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
