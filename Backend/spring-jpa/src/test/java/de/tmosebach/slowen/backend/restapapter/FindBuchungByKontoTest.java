package de.tmosebach.slowen.backend.restapapter;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import de.tmosebach.slowen.backend.domain.Asset;
import de.tmosebach.slowen.backend.domain.BuchhaltungService;
import de.tmosebach.slowen.backend.domain.Buchung;
import de.tmosebach.slowen.backend.domain.BuchungArt;
import de.tmosebach.slowen.backend.domain.Depot;
import de.tmosebach.slowen.backend.domain.Konto;
import de.tmosebach.slowen.backend.domain.Page;
import de.tmosebach.slowen.backend.domain.Umsatz;

@WebMvcTest
public class FindBuchungByKontoTest {
	
	private static final Long KTO_ID = 4711L;
	private static final Integer PAGE_NUMMER = 1;
	private static final Integer PAGE_SIZE = 20;
	private static final Long TOTAL_ELEMENTS = 1L;
	private static final Integer TOTAL_PAGES = 2;
	private static final LocalDate VALUTA = LocalDate.of(2021, 10, 10);
	
	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private BuchhaltungService serviceMock;
	
	@Test
	void testBuchungByKonto() throws Exception {

		Konto giro = new Konto();
		giro.setName("Giro");
		
		Umsatz kontoUmsatz = new Umsatz();
		kontoUmsatz.setBetrag(BigDecimal.TEN.negate());
		kontoUmsatz.setValuta(VALUTA);
		kontoUmsatz.setKonto(giro);
		
		Asset asset = new Asset();
		asset.setName("Aktie");
		
		Depot depot = new Depot();
		depot.setName("Depot");
		
		Umsatz depotUmsatz = new Umsatz();
		depotUmsatz.setAsset(asset);
		depotUmsatz.setBetrag(BigDecimal.TEN);
		depotUmsatz.setValuta(VALUTA);
		depotUmsatz.setMenge(BigDecimal.ONE);
		depotUmsatz.setKonto(depot);
		
		Buchung buchung = new Buchung();
		buchung.setArt(BuchungArt.Kauf);
		buchung.setVerwendung("Aktienkauf");
		buchung.setUmsaetze( Arrays.asList( kontoUmsatz, depotUmsatz ));

		Page<Buchung> page = new Page<>(Arrays.asList(buchung), TOTAL_PAGES, TOTAL_ELEMENTS, PAGE_SIZE, PAGE_NUMMER);
		
		when(serviceMock.findBuchungenByKonto(KTO_ID, PAGE_NUMMER, PAGE_SIZE))
		.thenReturn(page);
		
		mockMvc.perform(get("/api/buchhaltung/buchungen/konto/4711")
			    .contentType("application/json"))
				.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
				
                .andExpect(jsonPath("$.content[0].art", is("Kauf")))
                .andExpect(jsonPath("$.content[0].verwendung", is("Aktienkauf")))
                .andExpect(jsonPath("$.content[0].umsaetze", hasSize(2)));
	}
}
