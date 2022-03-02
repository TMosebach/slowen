package de.tmosebach.slowen.backend.jpaadapter;

import static java.math.BigDecimal.valueOf;
import static org.mockito.MockitoAnnotations.openMocks;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

import javax.validation.Validator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;

import de.tmosebach.slowen.backend.domain.Bestand;
import de.tmosebach.slowen.backend.domain.Buchung;
import de.tmosebach.slowen.backend.domain.BuchungRepository;
import de.tmosebach.slowen.backend.domain.Konto;
import de.tmosebach.slowen.backend.domain.KontoRepository;
import de.tmosebach.slowen.backend.domain.Umsatz;
import de.tmosebach.slowen.backend.values.Betrag;
import de.tmosebach.slowen.backend.values.BuchungArt;
import de.tmosebach.slowen.backend.values.Menge;

class BuchhaltungServiceJpaTest {
	
	private static final String WAEHRUNG = "EUR";

	@Mock
	private Validator validatorMock;
	
	@Mock
	private BuchungRepository buchungRepositoryMock;
	
	@Mock
	private KontoRepository kontoRepositoryMock;
	
	private BuchhaltungServiceJpa impl;
	
	@BeforeEach
	void setUp() throws Exception {
		openMocks(this);
		impl = new BuchhaltungServiceJpa(validatorMock, buchungRepositoryMock, kontoRepositoryMock);
	}

	@Test
	void testBuchungMitNeuenKonten() {
		
		Buchung buchung = createBuchung();
		
		impl.buche(buchung);
		
		Optional<Konto> giro = impl.findKontoByName("Giro");
		assertTrue(giro.isPresent());
		assertEquals(BigDecimal.TEN.negate(), giro.get().getSaldo().getBetrag());
		
		Optional<Konto> tagesgeld = impl.findKontoByName("Tagesgeld");
		assertTrue(tagesgeld.isPresent());
		assertEquals(BigDecimal.TEN, tagesgeld.get().getSaldo().getBetrag());
	}
	
	@Test
	void testBuchung_auf_vorhandene_Konten_resultiert_in_korrektem_Saldo() {
		
		Buchung buchung = createBuchung();
		
		impl.buche(buchung);
		impl.buche(buchung);
		
		Optional<Konto> giro = impl.findKontoByName("Giro");
		assertTrue(giro.isPresent());
		assertEquals(BigDecimal.valueOf(-20), giro.get().getSaldo().getBetrag());
		
		Optional<Konto> tagesgeld = impl.findKontoByName("Tagesgeld");
		assertTrue(tagesgeld.isPresent());
		assertEquals(BigDecimal.valueOf(20), tagesgeld.get().getSaldo().getBetrag());
	}
	
	@Test
	void testKauf() {
		Buchung kauf = createKauf();
		
		impl.buche(kauf);
		
		Optional<Konto> giro = impl.findKontoByName("Giro");
		assertTrue(giro.isPresent());
		assertEquals(BigDecimal.valueOf(-2430.0), giro.get().getSaldo().getBetrag());
		
		Optional<Konto> provision = impl.findKontoByName("Provision");
		assertTrue(provision.isPresent());
		assertEquals(BigDecimal.valueOf(30.0), provision.get().getSaldo().getBetrag());
		
		Optional<Konto> depotOptional = impl.findKontoByName("Depot");
		assertTrue(depotOptional.isPresent());
		
		Konto depot = depotOptional.get();
		assertEquals(1, depot.getBestaende().size());
		Bestand bestand = depot.getBestaende().get(0);
		assertEquals(valueOf(2400.0), bestand.getEinstandsWert().getBetrag());
		assertEquals(valueOf(100.0), bestand.getMenge().getMenge());
	}
	
	private Buchung createKauf() {
		Buchung buchung = new Buchung();
		buchung.setArt(BuchungArt.Kauf);
		buchung.addUmsatz(createUmsatz("Giro", LocalDate.now(), new Betrag(valueOf(-2430.0), WAEHRUNG)));
		buchung.addUmsatz(createUmsatz("Provision", LocalDate.now(), new Betrag(valueOf(30.0), WAEHRUNG)));
		buchung.addUmsatz(
				createSkontroUmsatz("Depot", LocalDate.now(), new Betrag(valueOf(2400.0), WAEHRUNG),
						"Talanx AG", new Menge(100.0)));
		return buchung;
	}

	private Umsatz createSkontroUmsatz(String konto, LocalDate valuta, Betrag betrag, String asset, Menge menge) {
		Umsatz umsatz = createUmsatz(konto, valuta, betrag);
		umsatz.setAsset(asset);
		umsatz.setMenge(menge);
		return umsatz;
	}

	@Test
	void testZukauf() {
		Buchung kauf = createKauf();
		
		impl.buche(kauf);
		impl.buche(kauf);
		
		Optional<Konto> giro = impl.findKontoByName("Giro");
		assertTrue(giro.isPresent());
		assertEquals(BigDecimal.valueOf(-4860.0), giro.get().getSaldo().getBetrag());
		
		Optional<Konto> provision = impl.findKontoByName("Provision");
		assertTrue(provision.isPresent());
		assertEquals(BigDecimal.valueOf(60.0), provision.get().getSaldo().getBetrag());
		
		Optional<Konto> depotOptional = impl.findKontoByName("Depot");
		assertTrue(depotOptional.isPresent());
		
		Konto depot = depotOptional.get();
		assertEquals(1, depot.getBestaende().size());
		Bestand bestand = depot.getBestaende().get(0);
		assertEquals(valueOf(4800.0), bestand.getEinstandsWert().getBetrag());
		assertEquals(valueOf(200.0), bestand.getMenge().getMenge());
	}
	
	@Test
	void testVerkaufMitGewinn() {
		impl.buche(createKauf());
		impl.buche(createVerkauf(-100.0, -3000.0));
		
		Optional<Konto> giro = impl.findKontoByName("Giro");
		assertTrue(giro.isPresent());
		assertEquals(valueOf(540.0), giro.get().getSaldo().getBetrag());
		
		Optional<Konto> provision = impl.findKontoByName("Provision");
		assertTrue(provision.isPresent());
		assertEquals(valueOf(60.0), provision.get().getSaldo().getBetrag());
		
		Optional<Konto> kursgewinn = impl.findKontoByName("Kursgewinn");
		assertTrue(kursgewinn.isPresent());
		assertTrue(valueOf(-600.0).compareTo(kursgewinn.get().getSaldo().getBetrag()) == 0);
		
		Optional<Konto> depotOptional = impl.findKontoByName("Depot");
		assertTrue(depotOptional.isPresent());
		
		Konto depot = depotOptional.get();
		assertTrue(depot.getBestaende().isEmpty());
	}
	
	private Buchung createVerkauf(double menge, double wert) {
		Buchung buchung = new Buchung();
		buchung.setArt(BuchungArt.Verkauf);
		buchung.addUmsatz(createUmsatz("Giro", LocalDate.now(), new Betrag(valueOf(2970.0), WAEHRUNG)));
		buchung.addUmsatz(createUmsatz("Provision", LocalDate.now(), new Betrag(valueOf(30.0), WAEHRUNG)));
		buchung.addUmsatz(
				createSkontroUmsatz("Depot", LocalDate.now(), new Betrag(valueOf(wert), WAEHRUNG),
						"Talanx AG", new Menge(menge)));
		return buchung;
	}

	@Test
	void testTeilverkaufMitVerlust() {
		impl.buche(createKauf());
		impl.buche(createVerkauf(-50.0, -1000.0));
		
		Optional<Konto> giro = impl.findKontoByName("Giro");
		assertTrue(giro.isPresent());
		assertEquals(valueOf(540.0), giro.get().getSaldo().getBetrag());
		
		Optional<Konto> provision = impl.findKontoByName("Provision");
		assertTrue(provision.isPresent());
		assertEquals(valueOf(60.0), provision.get().getSaldo().getBetrag());
		
		Optional<Konto> kursverlust = impl.findKontoByName("Kursverlust");
		assertTrue(kursverlust.isPresent());
		assertTrue(valueOf(200.0).compareTo(kursverlust.get().getSaldo().getBetrag()) == 0);
		
		Optional<Konto> depotOptional = impl.findKontoByName("Depot");
		assertTrue(depotOptional.isPresent());
		
		Konto depot = depotOptional.get();
		assertTrue(depot.getBestaende().size() == 1);
	}
	
	@Test
	void testEinlieferung() {
		Buchung einlieferung = new Buchung();
		einlieferung.setArt(BuchungArt.Einlieferung);
		einlieferung.addUmsatz(
				createSkontroUmsatz("Depot", LocalDate.now(), new Betrag(valueOf(2400), WAEHRUNG),
						"Talanx AG", new Menge(100)));
		
		impl.buche(einlieferung);

		Optional<Konto> depotOptional = impl.findKontoByName("Depot");
		assertTrue(depotOptional.isPresent());
		
		Konto depot = depotOptional.get();
		assertEquals(1, depot.getBestaende().size());
		Bestand bestand = depot.getBestaende().get(0);
		assertEquals(valueOf(2400), bestand.getEinstandsWert().getBetrag());
		assertEquals(valueOf(100.0), bestand.getMenge().getMenge());
	}
	
	@Test
	void testErtrag() {
		Buchung ertrag = new Buchung();
		ertrag.setArt(BuchungArt.Ertrag);
		ertrag.addUmsatz(createUmsatz("Giro", LocalDate.now(), new Betrag(valueOf(300.0), WAEHRUNG)));
		ertrag.addUmsatz(createUmsatz("Dividende", LocalDate.now(), new Betrag(valueOf(-300.0), WAEHRUNG)));
		ertrag.addUmsatz(
				createSkontroUmsatz("Depot", LocalDate.now(), new Betrag(valueOf(0.0), WAEHRUNG),
						"Talanx AG", new Menge(0.0)));
		
		impl.buche(ertrag);
		
		Optional<Konto> giro = impl.findKontoByName("Giro");
		assertTrue(giro.isPresent());
		assertEquals(valueOf(300.0), giro.get().getSaldo().getBetrag());
		
		Optional<Konto> provision = impl.findKontoByName("Dividende");
		assertTrue(provision.isPresent());
		assertEquals(valueOf(-300.0), provision.get().getSaldo().getBetrag());	
	}

	private Buchung createBuchung() {
		Buchung buchung = new Buchung();
		buchung.setArt(BuchungArt.Buchung);
		buchung.addUmsatz(createUmsatz("Giro", LocalDate.now(), new Betrag(BigDecimal.TEN.negate(), WAEHRUNG)));
		buchung.addUmsatz(createUmsatz("Tagesgeld", LocalDate.now(), new Betrag(BigDecimal.TEN, WAEHRUNG)));
		return buchung;
	}
	
	private Umsatz createUmsatz(String konto, LocalDate valuta, Betrag betrag) {
		Umsatz umsatz = new Umsatz();
		umsatz.setKonto(konto);
		umsatz.setValuta(valuta);
		umsatz.setBetrag(betrag);
		return umsatz;
	}
}
