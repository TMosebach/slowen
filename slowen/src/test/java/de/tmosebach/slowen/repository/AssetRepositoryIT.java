package de.tmosebach.slowen.repository;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import de.tmosebach.slowen.model.Asset;

@ExtendWith(SpringExtension.class)
@DataJpaTest
@ActiveProfiles("dev")
class AssetRepositoryIT {

	@Autowired
	private AssetRepository assetRepository;
	
	@Test
	@Sql("testFindByNameStartWith.sql")
	void testFindByNameStartWith() {
		List<Asset> assets = assetRepository.findByNameStartsWith("B");
		
		assertEquals(2, assets.size());
	}

}
