package de.tmosebach.slowen.backend.restapapter;

import static org.mockito.Mockito.*;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import java.math.BigDecimal;
import java.util.Arrays;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import de.tmosebach.slowen.backend.domain.Asset;
import de.tmosebach.slowen.backend.domain.Bankkonto;
import de.tmosebach.slowen.backend.domain.Bestand;
import de.tmosebach.slowen.backend.domain.BilanzTyp;
import de.tmosebach.slowen.backend.domain.BuchhaltungService;
import de.tmosebach.slowen.backend.domain.Depot;
import de.tmosebach.slowen.backend.domain.Konto;
import de.tmosebach.slowen.backend.domain.Kreditkarte;

@WebMvcTest
class KontoAnlegenTest {
	
	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private BuchhaltungService serviceMock;
	
	@Test
	void testKontoAnlegen() throws Exception {
		
		Konto konto = new Konto();
		konto.setName("Giro");
		konto.setBilanzTyp(BilanzTyp.Kontokorrent);
		
		Konto response = new Konto();
		response.setId(4711L);
		response.setName("Giro");
		response.setBilanzTyp(BilanzTyp.Kontokorrent);
		
		when(serviceMock.kontoAnlegen(konto))
		.thenReturn(response);

		mockMvc.perform(post("/api/buchhaltung/konten")
                .contentType("application/json")
                .content("{ \"name\":\"Giro\", \"typ\":\"Konto\", \"bilanzTyp\":\"Kontokorrent\" }")
			)
            .andExpect(jsonPath("$.id", is("4711")))
            .andExpect(jsonPath("$.name", is("Giro")))
            .andExpect(jsonPath("$.typ", is("Konto")))
            .andExpect(jsonPath("$.bilanzTyp", is("Kontokorrent")));
	}

	@Test
	void testBankkontoAnlegen() throws Exception {
		Bankkonto konto = new Bankkonto();
		konto.setBank("ING");
		konto.setBic("INGXXX");
		konto.setIban("DE0500");
		konto.setBilanzTyp(BilanzTyp.Vermoegen);
		
		Bankkonto response = new Bankkonto();
		response.setId(4711L);
		response.setBank("ING");
		response.setBic("INGXXX");
		response.setIban("DE0500");
		response.setBilanzTyp(BilanzTyp.Vermoegen);
		
		when(serviceMock.kontoAnlegen(eq(konto)))
		.thenReturn(response);

		mockMvc.perform(post("/api/buchhaltung/konten")
                .contentType("application/json")
                .content(
                	"{ \"typ\":\"Bankkonto\", "
                	+ "\"bank\":\"ING\", "
                	+ "\"bic\":\"INGXXX\", "
                	+ "\"iban\":\"DE0500\", "
                	+ "\"bilanzTyp\":\"Vermoegen\" }")
			)
            .andExpect(jsonPath("$.id", is("4711")))
            .andExpect(jsonPath("$.bank", is("ING")))
            .andExpect(jsonPath("$.bic", is("INGXXX")))
            .andExpect(jsonPath("$.iban", is("DE0500")))
            .andExpect(jsonPath("$.bilanzTyp", is("Vermoegen")));
	}

	@Test
	void testDepotAnlegen() {
		fail();
	}

	@Test
	void testKreditkarteAnlegen() {
		fail();
	}

	@Test
	void testVersicherungAnlegen() {
		fail();
	}
}
