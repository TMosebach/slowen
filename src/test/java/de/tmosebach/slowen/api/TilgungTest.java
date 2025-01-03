package de.tmosebach.slowen.api;

import static de.tmosebach.slowen.domain.Kontonamen.KEST;
import static de.tmosebach.slowen.domain.Kontonamen.KURSVERLUST;
import static de.tmosebach.slowen.domain.Kontonamen.SOLI;
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
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.jdbc.Sql;

import de.tmosebach.slowen.DataInitializer;
import de.tmosebach.slowen.api.input.Tilgung;
import de.tmosebach.slowen.domain.Bestand;
import de.tmosebach.slowen.domain.DepotBestand;
import de.tmosebach.slowen.domain.Konto;
import de.tmosebach.slowen.domain.KontoBestand;
import de.tmosebach.slowen.domain.KontoService;
import de.tmosebach.slowen.values.KontoArt;

@SpringBootTest
@Sql({"clearDB.sql"})
class TilgungTest {

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
	void testTilgung() {
		
		createKonto(KONTO, Konto);
		createKonto(KEST, Konto);
		createKonto(SOLI, Konto);
		createKonto(DEPOT, Depot);
		createKonto(KURSVERLUST, Konto);
		
		Bestand target = new Bestand();
		target.setAsset(ISIN);
		target.setEinstand(valueOf(1980));
		target.setMenge(valueOf(2000));
		DepotBestand depotBestand = kontoService.findDepotBestandByName("Depot");
		depotBestand.add(target);
		
		Tilgung tilgung = new Tilgung();
		tilgung.setDatum(DATUM);
		tilgung.setDepot(DEPOT);
		tilgung.setAsset(ISIN);
		tilgung.setMenge(valueOf(2000));
		tilgung.setKonto(KONTO);
		tilgung.setBetrag(valueOf(1975.0));
		tilgung.setValuta(VALUTA);
		tilgung.setKest(valueOf(10.0));
		tilgung.setSoli(valueOf(5.0));
		
		impl.tilge(tilgung);
		
		List<Bestand> bestaende = depotBestand.getBestaende();
		assertEquals(1, bestaende.size());
		
		Bestand bestand = bestaende.get(0);
		assertEquals(ISIN, bestand.getAsset());
		assertEquals(0, valueOf(0).compareTo(bestand.getMenge()));
		assertEquals(0, valueOf(0.00).compareTo(bestand.getEinstand()));

		assertKonto(valueOf(1960.0), "Konto");
		assertKonto(valueOf(10.0), KEST);
		assertKonto(valueOf(5.0), SOLI);
		assertKonto(valueOf(20.0), KURSVERLUST);
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
