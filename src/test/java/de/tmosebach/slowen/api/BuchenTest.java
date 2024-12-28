package de.tmosebach.slowen.api;

import static de.tmosebach.slowen.values.KontoArt.Konto;
import static java.math.BigDecimal.valueOf;
import static java.time.LocalDate.of;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;

import de.tmosebach.slowen.api.input.Buchung;
import de.tmosebach.slowen.api.input.Umsatz;
import de.tmosebach.slowen.domain.Konto;
import de.tmosebach.slowen.domain.KontoBestand;
import de.tmosebach.slowen.domain.KontoService;
import de.tmosebach.slowen.values.KontoArt;

@SpringBootTest
class BuchenTest {
	
	private static final LocalDate DATUM = of(2024, 8, 31);
	private static final LocalDate VALUTA = of(2024, 9, 2);
	
	@Autowired
	private MutationController impl;
	
	@Autowired
	private KontoService kontoService;

	@Test
	@Sql({"clearDB.sql"})
	void testBuchen() {
		
		createKonto("Giro", Konto);
		createKonto("Tagesgeld", Konto);
		
		Buchung buchung = new Buchung();
		buchung.setDatum(DATUM);
		buchung.setEmpfaenger("ich");
		buchung.setVerwendung("sparen");
		
		Umsatz giroUmsatz = new Umsatz();
		giroUmsatz.setKonto("Giro");
		giroUmsatz.setValuta(VALUTA);
		giroUmsatz.setBetrag(valueOf(-50.22));
		
		Umsatz tagesgeldUmsatz = new Umsatz();
		tagesgeldUmsatz.setKonto("Tagesgeld");
		tagesgeldUmsatz.setValuta(VALUTA);
		tagesgeldUmsatz.setBetrag(valueOf(50.22));
		
		buchung.setUmsaetze(List.of(giroUmsatz, tagesgeldUmsatz));

		impl.buche(buchung);

		KontoBestand giroBestand = kontoService.findKontoBestandByName("Giro");
		assertEquals(valueOf(-50.22), giroBestand.getSaldo());
		assertEquals(of(2024, 8, 31), giroBestand.getDatum());
		
		KontoBestand tagesgeldBestand = kontoService.findKontoBestandByName("Tagesgeld");
		assertEquals(valueOf(50.22), tagesgeldBestand.getSaldo());
		assertEquals(of(2024, 8, 31), tagesgeldBestand.getDatum());
	}
	
	private void createKonto(String kontoName, KontoArt art) {
		Konto konto = new Konto();
		konto.setName(kontoName);
		konto.setArt(art);
		kontoService.neuesKonto(konto);
	}
}
