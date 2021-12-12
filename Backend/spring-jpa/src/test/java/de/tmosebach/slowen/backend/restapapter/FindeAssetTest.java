package de.tmosebach.slowen.backend.restapapter;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import java.util.Arrays;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import de.tmosebach.slowen.backend.domain.Asset;
import de.tmosebach.slowen.backend.domain.BuchhaltungService;

@WebMvcTest
class FindeAssetTest {
	
	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private BuchhaltungService serviceMock;
	
	@Test
	void testFindAssets() throws Exception {
		
		Asset asset1 = new Asset();
		asset1.setId(815L);
		asset1.setName("Asset1");
		
		Asset asset2 = new Asset();
		asset2.setId(816L);
		asset2.setName("Asset2");
		
		when(serviceMock.findAssets())
		.thenReturn(Arrays.asList( asset1, asset2 ));
		
		mockMvc.perform(get("/api/buchhaltung/assets")
			    .contentType("application/json"))
				.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$", hasSize(2)))
				
                .andExpect(jsonPath("$[0].id", is("815")))
                .andExpect(jsonPath("$[0].name", is("Asset1")))
                
                .andExpect(jsonPath("$[1].id", is("816")))
                .andExpect(jsonPath("$[1].name", is("Asset2")));
	}
}
