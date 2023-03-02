package de.tmosebach.slowen.input;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

class DateParserTest {

	@Test
	void testShort() {
		assertEquals(
				LocalDate.of(2022, 4, 8),
				DateParser.parseDate("8.4.2022"));
	}

}
