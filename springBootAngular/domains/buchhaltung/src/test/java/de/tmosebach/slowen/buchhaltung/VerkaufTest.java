package de.tmosebach.slowen.buchhaltung;

import static java.math.BigDecimal.ZERO;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.openMocks;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;

import de.tmosebach.slowen.buchhaltung.builder.BuchungBuilder;
import de.tmosebach.slowen.buchhaltung.builder.HandelBuilder;
import de.tmosebach.slowen.konten.Bestand;
import de.tmosebach.slowen.konten.BilanzType;
import de.tmosebach.slowen.konten.Konto;
import de.tmosebach.slowen.konten.KontoService;
import de.tmosebach.slowen.shared.values.AssetIdentifier;
import de.tmosebach.slowen.shared.values.Betrag;
import de.tmosebach.slowen.shared.values.KontoIdentifier;

class VerkaufTest {
	
	private static final KontoIdentifier GIRO = new KontoIdentifier("Giro");
	private static final KontoIdentifier DEPOT = new KontoIdentifier("Depot");
	private static final KontoIdentifier PROVISION = new KontoIdentifier("Provision");
	private static final KontoIdentifier KURSGEWINN = Basiskonten.KURSGEWINN;
	private static final KontoIdentifier KURSVERLUST = Basiskonten.KURSVERLUST;
	
	@Mock
	private KontoService kontoServiceMock;
	
	@Mock
	private BuchungRepository buchungRepositoryMock;

	private BuchungService impl;
	
	@BeforeEach
	public void setUp() {
		openMocks(this);
		
		impl = new BuchungService(kontoServiceMock, buchungRepositoryMock);
	}
	
	@Test
	void testVollstaendigerVerkaufMitGewinn() {
		
		Konto giroKonto = Konto.newKonto(GIRO, "Giro", BilanzType.Bestand);
		Konto depotKonto = Konto.newDepot(DEPOT, "Depot");
		Konto provisionKonto = Konto.newKonto(PROVISION, "Provision", BilanzType.GuV);
		Konto kursgewinnKonto = Konto.newKonto(KURSGEWINN, "Kursgewinn", BilanzType.GuV);
		
		LocalDate now = LocalDate.now();
		
		when(kontoServiceMock.findById(GIRO))
		.thenReturn(Optional.of(giroKonto));
		
		when(kontoServiceMock.findById(DEPOT))
		.thenReturn(Optional.of(depotKonto));
		
		when(kontoServiceMock.findById(PROVISION))
		.thenReturn(Optional.of(provisionKonto));
		
		when(kontoServiceMock.findById(KURSGEWINN))
		.thenReturn(Optional.of(kursgewinnKonto));
		
		AssetIdentifier asset = new AssetIdentifier("Aktie");
		Bestand vorBestand = new Bestand(DEPOT, asset);
		vorBestand.addBestand(BigDecimal.valueOf(20), new Betrag(800.0));
		depotKonto.addBestand(vorBestand);
		
		
		HandelBuilder builder = 
				BuchungBuilder.verkauf(now, asset)
				.ausDepot(DEPOT)
				.menge(BigDecimal.valueOf(20.0))
				.kurs(BigDecimal.valueOf(50.0))
				.zuGunsten(GIRO)
				.gebuehr(PROVISION, new Betrag(20.0));
		
		Buchung buchung = impl.buche(builder.build());
		
		assertNotNull(buchung);
		
		assertEquals(new Betrag(980.0), giroKonto.getSaldo());
		assertEquals(new Betrag(20.0), provisionKonto.getSaldo());
		assertEquals(new Betrag(0.0), depotKonto.getSaldo());
		assertEquals(new Betrag(200.0), kursgewinnKonto.getSaldo());
	
		List<Bestand> bestaende = depotKonto.getBestaende();
		assertEquals(1 , bestaende.size());
		
		Bestand bestand = bestaende.get(0);
		assertTrue(ZERO.compareTo(bestand.getMenge()) == 0);
		assertTrue(ZERO.compareTo(bestand.getKaufWert().getWert()) == 0);
	}
	
	@Test
	void testTeilverkaufMitVerlust() {
		
		Konto giroKonto = Konto.newKonto(GIRO, "Giro", BilanzType.Bestand);
		Konto depotKonto = Konto.newDepot(DEPOT, "Depot");
		Konto provisionKonto = Konto.newKonto(PROVISION, "Provision", BilanzType.GuV);
		Konto kursverlustKonto = Konto.newKonto(KURSVERLUST, "Kursverlust", BilanzType.GuV);
		
		LocalDate now = LocalDate.now();
		
		when(kontoServiceMock.findById(GIRO))
		.thenReturn(Optional.of(giroKonto));
		
		when(kontoServiceMock.findById(DEPOT))
		.thenReturn(Optional.of(depotKonto));
		
		when(kontoServiceMock.findById(PROVISION))
		.thenReturn(Optional.of(provisionKonto));
		
		when(kontoServiceMock.findById(KURSVERLUST))
		.thenReturn(Optional.of(kursverlustKonto));
		
		AssetIdentifier asset = new AssetIdentifier("Aktie");
		Bestand vorBestand = new Bestand(DEPOT, asset);
		vorBestand.addBestand(BigDecimal.valueOf(40), new Betrag(2200.0));
		depotKonto.addBestand(vorBestand);
		
		
		HandelBuilder builder = 
				BuchungBuilder.verkauf(now, asset)
				.ausDepot(DEPOT)
				.menge(BigDecimal.valueOf(20.0))
				.kurs(BigDecimal.valueOf(50.0))
				.zuGunsten(GIRO)
				.gebuehr(PROVISION, new Betrag(20.0));
		
		Buchung buchung = impl.buche(builder.build());
		
		assertNotNull(buchung);
		
		assertEquals(new Betrag(980.0), giroKonto.getSaldo());
		assertEquals(new Betrag(20.0), provisionKonto.getSaldo());
		assertEquals(new Betrag(1100.0), depotKonto.getSaldo());
		assertEquals(new Betrag(-100.0), kursverlustKonto.getSaldo());
	
		List<Bestand> bestaende = depotKonto.getBestaende();
		assertEquals(1 , bestaende.size());
		
		Bestand bestand = bestaende.get(0);
		assertTrue(BigDecimal.valueOf(20).compareTo(bestand.getMenge()) == 0);
		assertTrue(BigDecimal.valueOf(1100).compareTo(bestand.getKaufWert().getWert()) == 0);
	}
}
