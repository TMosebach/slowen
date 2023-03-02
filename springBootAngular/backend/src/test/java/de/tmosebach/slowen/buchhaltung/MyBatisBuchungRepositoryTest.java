package de.tmosebach.slowen.buchhaltung;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import de.tmosebach.slowen.buchhaltung.builder.BuchungBuilder;
import de.tmosebach.slowen.shared.values.AssetIdentifier;
import de.tmosebach.slowen.shared.values.KontoIdentifier;

@MybatisTest(properties = { "mybatis.mapper-locations=classpath*:mappings/*.xml" })
public class MyBatisBuchungRepositoryTest {
	
	private static final BuchungSelection BASIS_SELECTION = 
			new BuchungSelection("giro").size(3);

	@Autowired
	private BuchungRepository buchungRepository;
	
	@Test
	void testSaveBuchung() {
		
		KontoIdentifier depot = new KontoIdentifier("80ea8975-8456-4a56-b766-eab79c907cdf");
		KontoIdentifier konto = new KontoIdentifier("02e1e286-b100-4e50-9d20-0f8d27cf0b46");
		AssetIdentifier asset = new AssetIdentifier("asset");
		
		Buchung buchung = 
				BuchungBuilder.kauf(LocalDate.now(), asset)
				.insDepot(depot)
				.menge(BigDecimal.valueOf(20.0))
				.kurs(BigDecimal.valueOf(50.0))
				.zuLasten(konto)
				.build();
		
		buchungRepository.save(buchung);
		buchung.getUmsaetze().forEach( u -> buchungRepository.saveUmsatz(u));
		
		List<Buchung> result = 
				buchungRepository.findBuchungPagedByKonto(
						new BuchungSelection("80ea8975-8456-4a56-b766-eab79c907cdf"));
		assertEquals(1, result.size());
	}
	
	@Test
	@Sql("/findBuchung.sql")
	void testCount() {
		assertEquals(2, buchungRepository.count(new BuchungSelection("konto").size(3)));
	}
	
	@Test
	@Sql("/findBuchung.sql")
	void testFind_alle_auf_einer_Seite() {
		assertEquals(4, 
				buchungRepository.findBuchungPagedByKonto( BASIS_SELECTION.size(4).page(1) )
				.size());
	}
	
	@Test
	@Sql("/findBuchung.sql")
	void testFind_folgende_Seiten_sind_ller() {
		assertEquals(0,
				buchungRepository.findBuchungPagedByKonto( BASIS_SELECTION.size(4).page(2) )
				.size());
	}
	
	@Test
	@Sql("/findBuchung.sql")
	void testFind_der_Rest_auf_der_letzten_Seite_sortiert() {
		
		BuchungSelection basisKriterien = BASIS_SELECTION.size(3);
		
		List<Buchung> seite1 =
				buchungRepository.findBuchungPagedByKonto( 
						basisKriterien.page(1) );
		assertEquals(3, seite1.size());
		
		// Seite von hinten aufsteigend in der Valuta / Buchungsdatum sortiert
		assertEquals("2", seite1.get(0).getId().getId());
		assertEquals("3", seite1.get(2).getId().getId());
		
		List<Buchung> seite2 = 
				buchungRepository.findBuchungPagedByKonto( 
						basisKriterien.page(2));
		assertEquals(1, seite2.size());
		
		// Älteste zuletzt
		assertEquals("1", seite2.get(0).getId().getId());
	}
	
	@Test
	@Sql("/findBuchung.sql")
	void testFind_by_Patterb() {
		List<Buchung> patternList = buchungRepository.findBuchungByPattern("pattern");
		
		assertEquals(3, patternList.size());
	}
}
