package de.tmosebach.slowen.backend.domain;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class BuchenTest {
	
	@Autowired
	private BuchhaltungService impl;

	@Test
	void testEinfacheBuchung() {
		
		Konto giro = new Konto();
		giro.setName("Giro");
		
		giro = impl.kontoAnlegen(giro);
		
		Umsatz giroUmsatz = new Umsatz();
		giroUmsatz.setKonto(giro);
		giroUmsatz.setValuta(LocalDate.now());
		giroUmsatz.setBetrag(BigDecimal.TEN.negate());
		
		Konto tagesgeld = new Konto();
		tagesgeld.setName("Tagesgeld");
		
		tagesgeld = impl.kontoAnlegen(tagesgeld);
		
		Umsatz tagesgeldUmsatz = new Umsatz();
		tagesgeldUmsatz.setKonto(tagesgeld);
		tagesgeldUmsatz.setValuta(LocalDate.now());
		tagesgeldUmsatz.setBetrag(BigDecimal.TEN);
		
		Buchung buchung = new Buchung();
		buchung.setVerwendung("Sparen");
		buchung.addUmsatz(giroUmsatz);
		buchung.addUmsatz(tagesgeldUmsatz);
		
		impl.buchen(buchung);
		
		List<Konto> konten = impl.findKonten();
		Konto result = konten.stream().filter( k -> k.getName().equals("Tagesgeld")).findFirst().get();
		assertTrue(BigDecimal.TEN.compareTo(result.getSaldo()) == 0);
	}

	@Test
	void testMehrfacheBuchung() {
		
		Konto giro = new Konto();
		giro.setName("Giro");
		
		giro = impl.kontoAnlegen(giro);
		
		Umsatz giroUmsatz = new Umsatz();
		giroUmsatz.setKonto(giro);
		giroUmsatz.setValuta(LocalDate.now());
		giroUmsatz.setBetrag(BigDecimal.valueOf(-120.0));
		
		Konto strom = new Konto();
		strom.setName("Strom");
		
		strom = impl.kontoAnlegen(strom);
		
		Umsatz stromUmsatz = new Umsatz();
		stromUmsatz.setKonto(strom);
		stromUmsatz.setValuta(LocalDate.now());
		stromUmsatz.setBetrag(BigDecimal.valueOf(40.0));
		
		Konto gas = new Konto();
		gas.setName("Gas");
		
		gas = impl.kontoAnlegen(gas);
		
		Umsatz gasUmsatz = new Umsatz();
		gasUmsatz.setKonto(gas);
		gasUmsatz.setValuta(LocalDate.now());
		gasUmsatz.setBetrag(BigDecimal.valueOf(80.0));
		
		Buchung buchung = new Buchung();
		buchung.setVerwendung("Sparen");
		buchung.addUmsatz(giroUmsatz);
		buchung.addUmsatz(stromUmsatz);
		buchung.addUmsatz(gasUmsatz);
		
		impl.buchen(buchung);
		
		List<Konto> konten = impl.findKonten();
		Konto resultGas = konten.stream().filter( k -> k.getName().equals("Gas")).findFirst().get();
		assertTrue(BigDecimal.valueOf(80.0).compareTo(resultGas.getSaldo()) == 0);
	}
}
