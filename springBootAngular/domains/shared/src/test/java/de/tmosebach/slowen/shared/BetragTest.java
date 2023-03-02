package de.tmosebach.slowen.shared;

import static org.junit.jupiter.api.Assertions.*;
import static de.tmosebach.slowen.shared.values.Waehrung.EUR;
import static de.tmosebach.slowen.shared.values.Waehrung.USD;
import static java.math.BigDecimal.ONE;
import static java.math.BigDecimal.TEN;
import static java.math.BigDecimal.ZERO;

import org.junit.jupiter.api.Test;

import de.tmosebach.slowen.shared.values.Betrag;

class BetragTest {

	@Test
	void testBetragIstGleich() {
		assertEquals(new Betrag(TEN, EUR), new Betrag(TEN, EUR));
	}

	@Test
	void testBetrag_ist_ungleich_in_der_Waehrung() {
		assertNotEquals(new Betrag(TEN, EUR), new Betrag(TEN, USD));
	}
	
	@Test
	void testBetrag_ist_ungleich_im_Wert() {
		assertNotEquals(new Betrag(ONE), new Betrag(TEN, USD));
	}
	
	@Test
	void test_0_Betrag_ist_bedingt_auf_Waehrung_dimensionslos() {
		assertTrue(new Betrag(ZERO, null).equals(new Betrag(ZERO, EUR)) );
		assertTrue(new Betrag(ZERO, EUR).equals(new Betrag(ZERO, null)) );
	}
	
	@Test
	void testAddieren_mit_bleibender_Waehrung() {
		Betrag a = new Betrag(10.0, USD);
		Betrag b = new Betrag(20.0, USD);
		
		Betrag summe = new Betrag(30.0, USD);
		
		assertEquals(summe, a.add(b));
	}
	
	@Test
	void testKein_Addieren_bei_unterschiedlichen_Waehrungen() {
		
		Betrag a = new Betrag(10.0, USD);
		Betrag b = new Betrag(20.0, EUR);
		
		assertThrows(IllegalArgumentException.class, () -> a.add(b) );
	}
	
	@Test
	void testDimensionsloses_Addieren_ist_ok() {
		
		Betrag betrag = new Betrag(20.0, EUR);
		
		assertEquals(betrag, Betrag.NULL_EUR.add(betrag));
	}
	
	@Test
	void testSubtrahierenk() {
		
		Betrag betrag = new Betrag(20.0, EUR);
		Betrag result = new Betrag(10.0, EUR);
		
		assertEquals(result, betrag.subtract(result));
	}
	
	@Test
	void testIstPositiv() {
		assertTrue(new Betrag(20.0, EUR).istPositiv());
	}
	
	@Test
	void testIst_nicht_positiv() {
		assertFalse(new Betrag(0.0, EUR).istPositiv());
	}
	
	@Test
	void testIst_echt_nichtPositiv() {
		assertFalse(new Betrag(-0.01, EUR).istPositiv());
	}
	
	@Test
	void testIstNegativ() {
		assertTrue(new Betrag(-.01, EUR).istNegativ());
	}
	
	@Test
	void testIst_nicht_negativ() {
		assertFalse(new Betrag(0.0, EUR).istNegativ());
	}
	
	@Test
	void testIst_echt_nichtNegativ() {
		assertFalse(new Betrag(0.01, EUR).istNegativ());
	}
	
	@Test
	void testMultiply() {
		assertEquals(new Betrag(30, EUR), new Betrag(10, EUR).multiply(3));
	}
}
