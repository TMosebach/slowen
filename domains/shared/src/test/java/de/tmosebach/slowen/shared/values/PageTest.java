package de.tmosebach.slowen.shared.values;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;

class PageTest {

	@Test
	void testPasst_auf_Seite() {
		List<String> content = List.of("1", "2");
		
		Page<String> page = 
			new Page<String>()
				.content(content)
				.elementCount(2)
				.page(1)
				.size(2);
		
		assertEquals(1, page.getPageCount());
	}

	@Test
	void testRest_auf_Folgeseite() {
		List<String> content = List.of("1", "2");
		
		Page<String> page = 
			new Page<String>()
				.content(content)
				.elementCount(2)
				.page(1)
				.size(1);
		
		assertEquals(2, page.getPageCount());
	}
}
