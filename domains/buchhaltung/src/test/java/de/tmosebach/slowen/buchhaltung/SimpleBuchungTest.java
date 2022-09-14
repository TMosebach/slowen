package de.tmosebach.slowen.buchhaltung;

import static org.mockito.ArgumentMatchers.isA;
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

class SimpleBuchungTest {
	
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
	void testEinfachsteBuchung() {
		KontoIdentifier giro = new KontoIdentifier("Giro");
		KontoIdentifier miete = new KontoIdentifier("Miete");
		
		SimpleKonto giroKonto = new SimpleKonto(giro, "Giro", BilanzType.Bestand);
		SimpleKonto mietKonto = new SimpleKonto(miete, "Miete", BilanzType.GuV);
		
		LocalDate now = LocalDate.now();
		
		when(kontoServiceMock.findById(giro))
		.thenReturn(Optional.of(giroKonto));
		
		when(kontoServiceMock.findById(miete))
		.thenReturn(Optional.of(mietKonto));
		
		BuchungBuilder builder = 
				BuchungBuilder.buche(now)
				.umsatz(giro, new Betrag(-500.0))
				.umsatz(miete, now.plusDays(1), new Betrag(500.0));
		
		Buchung buchung = impl.buche(builder.build());
		
		assertNotNull(buchung);
		verify(buchungRepositoryMock).save(buchung);
		verify(buchungRepositoryMock, times(2)).saveUmsatz(isA(Umsatz.class));
		
		assertEquals(new Betrag(-500.0), giroKonto.getSaldo());
		assertEquals(new Betrag(500.0), mietKonto.getSaldo());
	}

	@Test
	void testEinfache_Buchung_mit_optionalen_Daten() {
		KontoIdentifier giro = new KontoIdentifier("Giro");
		KontoIdentifier miete = new KontoIdentifier("Miete");
		
		SimpleKonto giroKonto = new SimpleKonto(giro, "Giro", BilanzType.Bestand);
		SimpleKonto mietKonto = new SimpleKonto(miete, "Miete", BilanzType.GuV);
		
		LocalDate now = LocalDate.now();
		
		when(kontoServiceMock.findById(giro))
		.thenReturn(Optional.of(giroKonto));
		
		when(kontoServiceMock.findById(miete))
		.thenReturn(Optional.of(mietKonto));
		
		BuchungBuilder builder = 
			BuchungBuilder.buche(now)
			.verwendung("Mietzahlung")
			.empfaenger("Vermieter")
			.umsatz(giro, new Betrag(-500.0))
			.umsatz(miete, now.plusDays(1), new Betrag(500.0));
		
		Buchung buchung = impl.buche(builder.build());
		
		assertNotNull(buchung);
		verify(buchungRepositoryMock).save(buchung);
		verify(buchungRepositoryMock, times(2)).saveUmsatz(isA(Umsatz.class));
		
		assertEquals(new Betrag(-500.0), giroKonto.getSaldo());
		assertEquals(new Betrag(500.0), mietKonto.getSaldo());
	}
}
