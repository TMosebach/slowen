package de.tmosebach.slowen.backend.restapapter;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import de.tmosebach.slowen.backend.domain.Bankkonto;
import de.tmosebach.slowen.backend.domain.BilanzTyp;
import de.tmosebach.slowen.backend.domain.BuchhaltungService;
import de.tmosebach.slowen.backend.domain.Depot;
import de.tmosebach.slowen.backend.domain.Konto;
import de.tmosebach.slowen.backend.domain.Kreditkarte;
import de.tmosebach.slowen.backend.domain.Versicherung;

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
	void testDepotAnlegen() throws Exception {
		Depot depot = new Depot();
		depot.setNummer("815");
		depot.setBilanzTyp(BilanzTyp.Vermoegen);
		
		Depot response = new Depot();
		response.setId(4711L);
		response.setNummer("815");
		response.setBilanzTyp(BilanzTyp.Vermoegen);
		
		when(serviceMock.kontoAnlegen(eq(depot)))
		.thenReturn(response);

		mockMvc.perform(post("/api/buchhaltung/konten")
                .contentType("application/json")
                .content(
                	"{ \"typ\":\"Depot\", "
                	+ "\"nummer\":\"815\", "
                	+ "\"bilanzTyp\":\"Vermoegen\" }")
			)
            .andExpect(jsonPath("$.id", is("4711")))
            .andExpect(jsonPath("$.nummer", is("815")))
            .andExpect(jsonPath("$.bilanzTyp", is("Vermoegen")));
	}

	@Test
	void testKreditkarteAnlegen() throws Exception {
		Kreditkarte depot = new Kreditkarte();
		depot.setGueltigBis("07/21");
		depot.setBilanzTyp(BilanzTyp.Verbindlichkeit);
		
		Kreditkarte response = new Kreditkarte();
		response.setId(4711L);
		response.setGueltigBis("07/21");
		response.setBilanzTyp(BilanzTyp.Verbindlichkeit);
		
		when(serviceMock.kontoAnlegen(eq(depot)))
		.thenReturn(response);

		mockMvc.perform(post("/api/buchhaltung/konten")
                .contentType("application/json")
                .content(
                	"{ \"typ\":\"Kreditkarte\", "
                	+ "\"gueltigBis\":\"07/21\", "
                	+ "\"bilanzTyp\":\"Verbindlichkeit\" }")
			)
            .andExpect(jsonPath("$.id", is("4711")))
            .andExpect(jsonPath("$.gueltigBis", is("07/21")))
            .andExpect(jsonPath("$.bilanzTyp", is("Verbindlichkeit")));
	}

	@Test
	void testVersicherungAnlegen() throws Exception {
		Versicherung depot = new Versicherung();
		depot.setNummer("815");
		depot.setBilanzTyp(BilanzTyp.Vermoegen);
		
		Versicherung response = new Versicherung();
		response.setId(4711L);
		response.setNummer("815");
		response.setBilanzTyp(BilanzTyp.Vermoegen);
		
		when(serviceMock.kontoAnlegen(eq(depot)))
		.thenReturn(response);

		mockMvc.perform(post("/api/buchhaltung/konten")
                .contentType("application/json")
                .content(
                	"{ \"typ\":\"Versicherung\", "
                	+ "\"nummer\":\"815\", "
                	+ "\"bilanzTyp\":\"Vermoegen\" }")
			)
            .andExpect(jsonPath("$.id", is("4711")))
            .andExpect(jsonPath("$.nummer", is("815")))
            .andExpect(jsonPath("$.bilanzTyp", is("Vermoegen")));
	}
}
