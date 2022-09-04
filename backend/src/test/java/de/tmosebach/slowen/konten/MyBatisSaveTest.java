package de.tmosebach.slowen.konten;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;

import de.tmosebach.slowen.shared.values.Waehrung;

@MybatisTest
class MyBatisSaveTest {

	@Autowired
	private MyBatisKontoRepository kontoRepository;
	
	@Test
	void testSaveKonto() {
		List<Konto> result = kontoRepository.findKonten();
		int countVorher = result.size();
		
		Konto konto = new SimpleKonto("id", "name", BilanzType.GuV, BigDecimal.TEN, Waehrung.USD);
		kontoRepository.save(konto);
		
		result = kontoRepository.findKonten();
		assertEquals(countVorher + 1, result.size());
	}
}
