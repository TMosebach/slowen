package de.tmosebach.slowen.buchhaltung;

import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.openMocks;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;

import de.tmosebach.slowen.buchhaltung.builder.KaufBuilder;
import de.tmosebach.slowen.konten.Bestand;
import de.tmosebach.slowen.konten.BilanzType;
import de.tmosebach.slowen.konten.Depot;
import de.tmosebach.slowen.konten.SimpleKonto;
import de.tmosebach.slowen.konten.KontoService;
import de.tmosebach.slowen.shared.values.AssetIdentifier;
import de.tmosebach.slowen.shared.values.Betrag;
import de.tmosebach.slowen.shared.values.KontoIdentifier;

class KaufTest {
	
	private static final KontoIdentifier GIRO = new KontoIdentifier("Giro");
	private static final KontoIdentifier DEPOT = new KontoIdentifier("Depot");
	private static final KontoIdentifier PROVISION = new KontoIdentifier("Provision");
	
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
	void testKauf() {
		SimpleKonto giroKonto = new SimpleKonto(GIRO, "Giro", BilanzType.Bestand);
		Depot depotKonto = new Depot(DEPOT, "Depot", BilanzType.Bestand);
		SimpleKonto provisionKonto = new SimpleKonto(DEPOT, "Provision", BilanzType.GuV);
		
		LocalDate now = LocalDate.now();
		
		when(kontoServiceMock.findById(GIRO))
		.thenReturn(Optional.of(giroKonto));
		
		when(kontoServiceMock.findById(DEPOT))
		.thenReturn(Optional.of(depotKonto));
		
		when(kontoServiceMock.findById(PROVISION))
		.thenReturn(Optional.of(provisionKonto));
		
		AssetIdentifier asset = new AssetIdentifier("Aktie");
		
		KaufBuilder builder = 
				new KaufBuilder(now) // Buchungsdatum
				.kauf(asset) // Typ + Asset
				.insDepot(DEPOT)
				.menge(BigDecimal.valueOf(20.0))
				.kurs(BigDecimal.valueOf(50.0))
				.zuLasten(GIRO)
				.gebuehr(PROVISION, new Betrag(20.0));
		
		Buchung buchung = impl.buche(builder.build());
		
		assertNotNull(buchung);
		
		assertEquals(new Betrag(-1020.0), giroKonto.getSaldo());
		assertEquals(new Betrag(20.0), provisionKonto.getSaldo());
		assertEquals(new Betrag(1000.0), depotKonto.getSaldo());
	
		List<Bestand> bestaende = depotKonto.getBestaende();
		assertEquals(1 , bestaende.size());
		
		Bestand bestand = bestaende.get(0);
		assertTrue(BigDecimal.valueOf(20.0).compareTo(bestand.getMenge()) == 0);
		assertEquals(new Betrag(1000.0), bestand.getKaufWert());
	}
	
	@Test
	void testZukauf() {
		SimpleKonto giroKonto = new SimpleKonto(GIRO, "Giro", BilanzType.Bestand);
		Depot depotKonto = new Depot(DEPOT, "Depot", BilanzType.Bestand);
		SimpleKonto provisionKonto = new SimpleKonto(DEPOT, "Provision", BilanzType.GuV);
		
		LocalDate now = LocalDate.now();
		
		when(kontoServiceMock.findById(GIRO))
		.thenReturn(Optional.of(giroKonto));
		
		when(kontoServiceMock.findById(DEPOT))
		.thenReturn(Optional.of(depotKonto));
		
		when(kontoServiceMock.findById(PROVISION))
		.thenReturn(Optional.of(provisionKonto));
		
		AssetIdentifier asset = new AssetIdentifier("Aktie");
		
		KaufBuilder builder = 
			new KaufBuilder(now) // Buchungsdatum
			.kauf(asset) // Typ + Asset
			.insDepot(DEPOT)
			.menge(BigDecimal.valueOf(20.0))
			.kurs(BigDecimal.valueOf(50.0))
			.zuLasten(GIRO)
			.gebuehr(PROVISION, new Betrag(20.0));
		
		Buchung kauf = builder.build();
		
		impl.buche(kauf);
		impl.buche(kauf);
		
		assertEquals(new Betrag(-2040.0), giroKonto.getSaldo());
		assertEquals(new Betrag(40.0), provisionKonto.getSaldo());
		assertEquals(new Betrag(2000.0), depotKonto.getSaldo());
		
		List<Bestand> bestaende = depotKonto.getBestaende();
		assertEquals(1 , bestaende.size());
		
		assertTrue(BigDecimal.valueOf(40.0).compareTo(bestaende.get(0).getMenge()) == 0);
	}
}
