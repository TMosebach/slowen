package de.tmosebach.slowen.konten;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.openMocks;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;

import de.tmosebach.slowen.shared.values.KontoIdentifier;
import de.tmosebach.slowen.shared.values.Waehrung;

class FindIdByNameTest {
	
	@Mock
	private KontoRepository kontoRepositoryMock;
	
	private KontoService impl;
	
	@BeforeEach
	public void setUp() {
		openMocks(this);
		
		impl = new KontoService(kontoRepositoryMock);
	}

	@Test
	void testFindeByName() {
		
		when(kontoRepositoryMock.findByName("Giro"))
		.thenReturn( Optional.of(new Konto("id", "Giro", KontoType.Konto, BilanzType.Bestand, BigDecimal.ZERO, Waehrung.EUR) ) );
		
		Optional<Konto> result = impl.findByName("Giro");

		assertEquals(new KontoIdentifier("id"), result.get().getId());
	}

	@Test
	void testUnbekannter_Name() {
		
		when(kontoRepositoryMock.findByName("Giro"))
		.thenReturn(Optional.empty());

		assertTrue(impl.findByName("Giro").isEmpty());
	}
}
