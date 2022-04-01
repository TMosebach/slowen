package de.tmosebach.slowen.backend.jpaadapter;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.openMocks;

import java.math.BigDecimal;
import java.time.LocalDate;

import javax.validation.Validator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;

import de.tmosebach.slowen.backend.domain.AssetRepository;
import de.tmosebach.slowen.backend.domain.Buchung;
import de.tmosebach.slowen.backend.domain.BuchungRepository;
import de.tmosebach.slowen.backend.domain.Konto;
import de.tmosebach.slowen.backend.domain.KontoRepository;
import de.tmosebach.slowen.backend.domain.Umsatz;
import de.tmosebach.slowen.backend.values.Betrag;
import de.tmosebach.slowen.backend.values.BuchungArt;

class BuchhaltungServiceJpa_searchBuchungenTest {

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
				validatorMock, buchungRepositoryMock, kontoRepositoryMock, assetRepositoryMock);
		
		mockNewKonto(1L, "Giro");
		mockNewKonto(2L, "Tagesgeld");
		
		impl.buche(createBuchung("Mit Beschreibung", "Mit Empfänger"));
		impl.buche(createBuchung("Nur Beschreibung", null));
		impl.buche(createBuchung(null, "Nur Empfänger"));
		impl.buche(createBuchung("Mit Beschreibung", "und anderem Empfänger"));
	}
	
	private void mockNewKonto(long id, String kontoName) {
		when(kontoRepositoryMock.save(new Konto(kontoName)))
		.thenReturn(new Konto(id, kontoName));
	}

	private Buchung createBuchung(String beschreibung, String empfaenger) {
		Buchung buchung = new Buchung();
		buchung.setArt(BuchungArt.Buchung);
		buchung.setBeschreibung(beschreibung);
		buchung.setEmpfaenger(empfaenger);
		buchung.addUmsatz(createUmsatz("Giro", LocalDate.now(), new Betrag(BigDecimal.TEN.negate(), WAEHRUNG)));
		buchung.addUmsatz(createUmsatz("Tagesgeld", LocalDate.now(), new Betrag(BigDecimal.TEN, WAEHRUNG)));
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
	
	@Test
	void testSearchBuchungen_mit_Pattern() {
		assertEquals(2, impl.searchBuchungen("Mit").size());
		assertEquals(2, impl.searchBuchungen("Nur").size());
		assertEquals(1, impl.searchBuchungen("anderem").size());
		assertEquals(3, impl.searchBuchungen("Empfänger").size());
	}
}
