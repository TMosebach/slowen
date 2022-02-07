package de.tmosebach.slowen.backend.restapapter;

import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import de.tmosebach.slowen.backend.domain.Asset;
import de.tmosebach.slowen.backend.domain.BuchhaltungService;

@WebMvcTest
class AssetAnlegenTest {
	
	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private BuchhaltungService serviceMock;
	
	@Test
	void testAssetAnlegen() throws Exception {
		
//		Asset konto = new Asset();
//		konto.setName("Aktie");
//		
//		Asset response = new Asset();
//		response.setId(4711L);
//		response.setName("Aktie");
//		
//		when(serviceMock.assetAnlegen(konto))
//		.thenReturn(response);
//
//		mockMvc.perform(post("/api/buchhaltung/assets")
//                .contentType("application/json")
//                .content("{ \"name\":\"Aktie\" }")
//			)
//            .andExpect(jsonPath("$.id", is("4711")))
//            .andExpect(jsonPath("$.name", is("Aktie")));
	}
}
