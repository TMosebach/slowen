package de.tmosebach.slowen.konten;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.only;
import static org.mockito.Mockito.verify;
import static org.mockito.MockitoAnnotations.openMocks;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;

import de.tmosebach.slowen.shared.values.Betrag;

class CreateKontoTest {
	
	@Mock
	private KontoRepository kontoRepositoryMock;
	
	private KontoService impl;
	
	@BeforeEach
	public void setUp() {
		openMocks(this);
		
		impl = new KontoService(kontoRepositoryMock);
	}

	@Test
	void testCreateSimpleKonto() {
		Konto konto = impl.createKonto(KontoType.Konto, "Giro", BilanzType.Bestand);
		
		assertNotNull(konto.getId(), "Id wurde generiert.");
		assertEquals("Giro", konto.getName());
		assertEquals(KontoType.Konto, konto.getKontoType());
		assertEquals(BilanzType.Bestand, konto.getBilanzType());
		assertEquals(Betrag.NULL_EUR, konto.getSaldo(), "Saldo mit 0 EUR initialisiert.");
		
		verify(kontoRepositoryMock, only()).save(konto);
	}

	@Test
	void testCreateDepot() {
		Konto konto = impl.createKonto(KontoType.Depot, "Giro", BilanzType.Bestand);
		
		assertNotNull(konto.getId(), "Id wurde generiert.");
		assertEquals("Giro", konto.getName());
		assertEquals(KontoType.Depot, konto.getKontoType());
		assertEquals(BilanzType.Bestand, konto.getBilanzType());
		
		verify(kontoRepositoryMock, only()).save(konto);
	}
}
