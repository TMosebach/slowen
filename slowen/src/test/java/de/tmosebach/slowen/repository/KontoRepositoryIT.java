package de.tmosebach.slowen.repository;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import de.tmosebach.slowen.model.Asset;
import de.tmosebach.slowen.model.Bestand;
import de.tmosebach.slowen.model.Depot;
import de.tmosebach.slowen.model.Konto;

@ExtendWith(SpringExtension.class)
@DataJpaTest
@ActiveProfiles("dev")
class KontoRepositoryIT {
	
	@Autowired
	private KontoRepository kontoRepository;
	
	@Autowired
	private AssetRepository assetRepository;

	@Test
	void testSaveKonto() {
		Konto konto = new Konto();
		konto.setName("konto");
		
		kontoRepository.save(konto);
		
		Optional<Konto> kontoOptional = kontoRepository.findByName("konto");
		assertTrue(kontoOptional.isPresent());
		
		Konto result = kontoOptional.get();
		assertEquals("konto", result.getName());
		assertEquals("K", result.getType());
	}
	
	@Test
	void testSaveDepot() {
		Depot depot = new Depot();
		depot.setName("depot");
		
		kontoRepository.save(depot);
		
		Optional<Konto> kontoOptional = kontoRepository.findByName("depot");
		assertTrue(kontoOptional.isPresent());
		
		Konto result = kontoOptional.get();
		assertEquals("depot", result.getName());
		assertEquals("D", result.getType());
		
		depot = (Depot)result;
		assertEquals(0, depot.getBestaende().size());
	}
	
	@Test
	void testAddBestand() {
		Depot depot = new Depot();
		depot.setName("bestandsDepot");
		
		kontoRepository.save(depot);
		
		Asset asset = new Asset();
		asset.setName("asset");
		assetRepository.save(asset);
		
		Bestand bestand = new Bestand();
		bestand.setAsset(asset);
		bestand.setKaufPreis(BigDecimal.ONE);
		bestand.setMenge(BigDecimal.TEN);
		depot.addBestand(bestand);
		
		kontoRepository.save(depot);
		
		Optional<Konto> kontoOptional = kontoRepository.findByName("bestandsDepot");
		assertTrue(kontoOptional.isPresent());
		
		Konto result = kontoOptional.get();
		assertEquals("bestandsDepot", result.getName());
		assertEquals("D", result.getType());
		
		depot = (Depot)result;
		assertEquals(1, depot.getBestaende().size());
	}
}
