package de.tmosebach.slowen.buchhaltung;

import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.openMocks;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;

import de.tmosebach.slowen.buchhaltung.builder.BuchungBuilder;
import de.tmosebach.slowen.konten.BilanzType;
import de.tmosebach.slowen.konten.SimpleKonto;
import de.tmosebach.slowen.konten.KontoService;
import de.tmosebach.slowen.shared.values.Betrag;
import de.tmosebach.slowen.shared.values.KontoIdentifier;

class MehrfachBuchungTest {
	
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
	void testMehrfachBuchung() {
		KontoIdentifier giro = new KontoIdentifier("Giro");
		KontoIdentifier gas = new KontoIdentifier("Gas");
		KontoIdentifier strom = new KontoIdentifier("Strom");
		
		SimpleKonto giroKonto = new SimpleKonto(giro, "Giro", BilanzType.Bestand);
		SimpleKonto gasKonto = new SimpleKonto(gas, "Gas", BilanzType.GuV);
		SimpleKonto stromKonto = new SimpleKonto(strom, "Konto", BilanzType.GuV);
		
		LocalDate now = LocalDate.now();
		
		when(kontoServiceMock.findById(giro))
		.thenReturn(Optional.of(giroKonto));
		
		when(kontoServiceMock.findById(gas))
		.thenReturn(Optional.of(gasKonto));
		
		when(kontoServiceMock.findById(strom))
		.thenReturn(Optional.of(stromKonto));
		
		BuchungBuilder builder = 
				BuchungBuilder.buche(now)
				.umsatz(giro, new Betrag(-600.0))
				.umsatz(gas, new Betrag(400.0))
				.umsatz(strom, new Betrag(200.0));
		
		Buchung buchung = impl.buche(builder.build());
		
		assertNotNull(buchung);
		verify(buchungRepositoryMock).save(buchung);
		verify(buchungRepositoryMock, times(3)).saveUmsatz(isA(Umsatz.class));
		
		assertEquals(new Betrag(-600.0), giroKonto.getSaldo());
		assertEquals(new Betrag(400.0), gasKonto.getSaldo());
		assertEquals(new Betrag(200.0), stromKonto.getSaldo());
	}
}
