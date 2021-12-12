package de.tmosebach.slowen.backend.restapapter;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import de.tmosebach.slowen.backend.domain.Asset;
import de.tmosebach.slowen.backend.domain.BuchhaltungService;
import de.tmosebach.slowen.backend.domain.Buchung;
import de.tmosebach.slowen.backend.domain.BuchungArt;
import de.tmosebach.slowen.backend.domain.Depot;
import de.tmosebach.slowen.backend.domain.Konto;
import de.tmosebach.slowen.backend.domain.Umsatz;

@WebMvcTest
public class BuchenTest {
	
	private static final LocalDate VALUTA = LocalDate.of(2021, 10, 10);
	
	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private BuchhaltungService serviceMock;
	
	@Test
	void testBuchen() throws Exception {

		Konto giro = new Konto();
		giro.setId(4711L);
		giro.setName("Giro");
		giro.setSaldo(BigDecimal.ZERO);
		
		Umsatz kontoUmsatz = new Umsatz();
		kontoUmsatz.setBetrag(BigDecimal.TEN.negate());
		kontoUmsatz.setValuta(VALUTA);
		kontoUmsatz.setKonto(giro);
		
		Asset asset = new Asset();
		asset.setName("Aktie");
		
		Depot depot = new Depot();
		depot.setId(4712L);
		depot.setName("Depot");
		depot.setSaldo(BigDecimal.ZERO);
		
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

		when(serviceMock.buchen(buchung))
		.thenReturn(buchung);
		
		mockMvc.perform(
			post("/api/buchhaltung/buchungen")
			    .contentType("application/json")
		        .content(
		        	  "	{ "
		        	+ "		\"art\": \"Kauf\", "
		        	+ "	  	\"verwendung\": \"Aktienkauf\", "
		        	+ "	  	\"umsaetze\": [ "
		        	+ "	  		{ "
		        	+ "				\"betrag\": -10, "
		        	+ "				\"valuta\": \"2021-10-10\", "
		        	+ "				\"konto\": { "
		        	+ "					\"id\": \"4711\", "
		        	+ "					\"name\": \"Giro\", "
		        	+ "					\"typ\": \"Konto\" "
		        	+ "				} "
		        	+ "	  		}, "
		        	+ "	  		{ "
		        	+ "				\"betrag\": 10, "
		        	+ "				\"valuta\": \"2021-10-10\", "
		        	+ "				\"menge\": 1, "
		        	+ "				\"asset\": { "
		        	+ "					\"name\": \"Aktie\" "
		        	+ "	   			}, "
		        	+ "				\"konto\": { "
		        	+ "					\"id\": \"4712\", "
		        	+ "					\"name\": \"Depot\", "
		        	+ "					\"typ\": \"Depot\" "
		        	+ "				} "
		        	+ "	 		 } "
		        	+ "		]"
		        	+ "}")
			)
            .andExpect(jsonPath("$.art", is("Kauf")))
            .andExpect(jsonPath("$.verwendung", is("Aktienkauf")))
            .andExpect(jsonPath("$.umsaetze", hasSize(2)));
	}
}
