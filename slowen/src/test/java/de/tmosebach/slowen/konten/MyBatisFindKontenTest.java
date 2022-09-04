package de.tmosebach.slowen.konten;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

@MybatisTest
class MyBatisFindKontenTest {

	@Autowired
	private MyBatisKontoRepository kontoRepository;
	
	/**
	 * Finde 2 Konten aus Skript + 2 Basiskonten
	 */
	@Test
	@Sql("/FindKonten.sql")
	void test() {
		List<Konto> result = kontoRepository.findKonten();
		
		assertEquals(4, result.size());
	}
}
