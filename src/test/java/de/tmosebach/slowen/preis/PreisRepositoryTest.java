package de.tmosebach.slowen.preis;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

@MybatisTest
class PreisRepositoryTest {
	
	private static final String REFERENZ = "TheAktie";

	@Autowired
	private PreisRepository impl;
	
	@Test
	@Sql(statements = "insert into PREISE (REFERENZ, DATUM, PREIS) values ('TheAktie', '2024-12-15', 21)")
	void testLatest() {
		
		Preis preis = new Preis();
		preis.setReferenz(REFERENZ);
		preis.setDatum(LocalDate.now());
		preis.setPreis(BigDecimal.valueOf(47.11));
		
		impl.savePreis(preis);
		
		Optional<Preis> gelesen = impl.getLetztenPreis(REFERENZ);
		assertTrue(gelesen.isPresent());
		assertTrue(preis.getPreis().compareTo( gelesen.get().getPreis() ) == 0);
	}

}
