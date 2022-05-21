package de.tmosebach.slowen.backend.jpaadapter;

import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.openMocks;

import java.math.BigDecimal;
import java.time.LocalDate;

import javax.validation.Validator;

import org.junit.jupiter.api.BeforeEach;
import org.mockito.Mock;

import de.tmosebach.slowen.backend.domain.AssetRepository;
import de.tmosebach.slowen.backend.domain.Buchung;
import de.tmosebach.slowen.backend.domain.BuchungRepository;
import de.tmosebach.slowen.backend.domain.Konto;
import de.tmosebach.slowen.backend.domain.KontoRepository;
import de.tmosebach.slowen.backend.domain.Umsatz;
import de.tmosebach.slowen.backend.values.Betrag;
import de.tmosebach.slowen.backend.values.BuchungArt;

class BuchhaltungServiceJpa_findBuchungenByKontoTest {

	private static final String WAEHRUNG = "EUR";

	@Mock
	private Validator validatorMock;
	
	@Mock
	private BuchungRepository buchungRepositoryMock;
	
	@Mock
	private KontoRepository kontoRepositoryMock;
	
	@Mock
	private AssetRepository assetRepositoryMock;

	private BuchhaltungServiceJpa impl;
	
	@BeforeEach
	void setUp() throws Exception {
		openMocks(this);
		impl = new BuchhaltungServiceJpa(
				validatorMock,
				buchungRepositoryMock,
				kontoRepositoryMock,
				assetRepositoryMock);

		mockNewKonto(1L, "Giro");
		mockNewKonto(2L, "Tagesgeld");
		for (int i = 1; i <= 9; i++) {
			impl.buche(createBuchung(i));
		}
	}
	
	private void mockNewKonto(long id, String kontoName) {
		when(kontoRepositoryMock.save(new Konto(kontoName)))
		.thenReturn(new Konto(id, kontoName));
	}
	
	private Buchung createBuchung(int nr) {
		Buchung buchung = new Buchung();
		buchung.setBeschreibung( Integer.toString(nr) );
		buchung.setArt(BuchungArt.Buchung);
		buchung.addUmsatz(createUmsatz("Giro", LocalDate.of(2022, 1, nr), new Betrag(BigDecimal.valueOf(nr), WAEHRUNG)));
		buchung.addUmsatz(createUmsatz("Tagesgeld", LocalDate.now(), new Betrag(BigDecimal.valueOf(-nr), WAEHRUNG)));
		return buchung;
	}
	
	private Umsatz createUmsatz(String kontoName, LocalDate valuta, Betrag betrag) {
		Umsatz umsatz = new Umsatz();
		Konto konto = new Konto();
		konto.setName(kontoName);
		umsatz.setKonto(konto);
		umsatz.setValuta(valuta);
		umsatz.setBetrag(betrag);
		return umsatz;
	}
	
	// TODO Test auf neue Schnittstelle umstellen
//	@Test
//	void testErsteSeite() {
//		List<Buchung> result = impl.findBuchungenByKonto(1L, 0, 3);
//		assertEquals(3, result.size());
//		assertEquals("7", result.get(0).getBeschreibung());
//		assertEquals("9", result.get(2).getBeschreibung());
//	}
//
//	@Test
//	void testZweiteSeite() {
//		List<Buchung> result = impl.findBuchungenByKonto(1L, 1L, 3L);
//		assertEquals(3, result.size());
//		assertEquals("4", result.get(0).getBeschreibung());
//		assertEquals("6", result.get(2).getBeschreibung());
//	}
//	
//	@Test
//	void testLetzteSeiteOhneRest() {
//		List<Buchung> result = impl.findBuchungenByKonto(1L, 2L, 3L);
//		assertEquals(3, result.size());
//		assertEquals("1", result.get(0).getBeschreibung());
//		assertEquals("3", result.get(2).getBeschreibung());
//	}
//	
//	@Test
//	void testLetzteSeiteMitRest() {
//		List<Buchung> result = impl.findBuchungenByKonto(1L, 1L, 5L);
//		assertEquals(4, result.size());
//		assertEquals("1", result.get(0).getBeschreibung());
//		assertEquals("4", result.get(3).getBeschreibung());
//	}
//	
//	@Test
//	void testEineSeiteUnvollstaendig() {
//		List<Buchung> result = impl.findBuchungenByKonto(1L, 0L, 10L);
//		assertEquals(9, result.size());
//	}
//	
//	@Test
//	void testNicht_existierende_page() {
//		List<Buchung> result = impl.findBuchungenByKonto(1L, 1L, 10L);
//		assertEquals(0, result.size());
//	}
}
