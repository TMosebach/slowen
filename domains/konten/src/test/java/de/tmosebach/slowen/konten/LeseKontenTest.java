package de.tmosebach.slowen.konten;

import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.openMocks;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;

class LeseKontenTest {
	
	@Mock
	private KontoRepository kontoRepositoryMock;
	
	private KontoService impl;
	
	@BeforeEach
	public void setUp() {
		openMocks(this);
		
		impl = new KontoService(kontoRepositoryMock);
	}

	@Test
	void testCreateKonto() {
		List<Konto> konten = List.of( Konto.newKonto(null, "Name", BilanzType.Bestand) );
		when(kontoRepositoryMock.findKonten())
		.thenReturn(konten);
			
		List<Konto> result = impl.findKonten();
		
		assertEquals(konten, result);
	}
}
