package de.tmosebach.slowen.konten;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import de.tmosebach.slowen.shared.values.KontoIdentifier;

@MybatisTest(properties = { "mybatis.mapper-locations=classpath*:mappings/*.xml" })
class MyBatisFindIdByNameTest {

	@Autowired
	private MyBatisKontoRepository kontoRepository;
	
	@Test
	@Sql("/FindIdByName.sql")
	void testKontoExistiert() {
		Optional<Konto> result = kontoRepository.findByName("Giro");
		assertFalse(result.isEmpty());
		assertEquals(new KontoIdentifier("theid"), result.get().getId());
	}
	
	@Test
	void testKontoUnbekannt() {
		assertTrue(kontoRepository.findByName("KennIchNicht").isEmpty());
	}
}
