package de.tmosebach.slowen.backend.restapapter;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import java.math.BigDecimal;
import java.util.Arrays;

import org.junit.jupiter.api.Test;
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

@WebMvcTest
class FindeKontenTest {
	
	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private BuchhaltungService serviceMock;
	
	@Test
	void testFindKonten() throws Exception {
		
		Bankkonto bankkonto = new Bankkonto();
		bankkonto.setBilanzTyp(BilanzTyp.Kontokorrent);
		bankkonto.setName("Giro");
		bankkonto.setIban("DE4711");
		bankkonto.setBic("BICXXX");
		bankkonto.setId(815L);
		bankkonto.setSaldo(BigDecimal.ZERO);
		
		Asset asset = new Asset();
		asset.setName("Aktie");
		asset.setId(816L);
		
		Bestand bestand = new Bestand();
		bestand.setAsset(asset);
		bestand.setId(817L);
		bestand.setMenge(BigDecimal.valueOf(40.0));
		bestand.setWert(BigDecimal.valueOf(123.45));
		
		Depot depot = new Depot();
		depot.addBestand(bestand);
		depot.setNummer("4712");
		
		when(serviceMock.findKonten())
		.thenReturn(Arrays.asList( bankkonto, depot ));
		
		mockMvc.perform(get("/api/buchhaltung/konten")
			    .contentType("application/json"))
				.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$", hasSize(2)))
				
                .andExpect(jsonPath("$[0].id", is("815")))
                .andExpect(jsonPath("$[0].name", is("Giro")))
                .andExpect(jsonPath("$[0].bilanzTyp", is("Kontokorrent")))
                .andExpect(jsonPath("$[0].bic", is("BICXXX")))
                .andExpect(jsonPath("$[0].iban", is("DE4711")))

                .andExpect(jsonPath("$[1].nummer", is("4712")))
                .andExpect(jsonPath("$[1].bestaende[0].id", is("817")))
                .andExpect(jsonPath("$[1].bestaende[0].asset.id", is("816")))
                .andExpect(jsonPath("$[1].bestaende[0].asset.name", is("Aktie")))
                .andExpect(jsonPath("$[1].bestaende[0].menge", is(40.0)))
                .andExpect(jsonPath("$[1].bestaende[0].wert", is(123.45)));
	}

}
