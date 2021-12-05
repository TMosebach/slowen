package de.tmosebach.slowen.backend.domain;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class AssetAnlegenTest {

	@Autowired
	private BuchhaltungService impl;
	
	@Test
	void test() {
		int count = impl.findAssets().size();
		
		Asset asset = new Asset();
		asset.setName("Telekom AG");
		
		Asset result = impl.neuesAsset(asset);
		
		assertNotNull(result);
		
		List<Asset> assets = impl.findAssets();
		assertTrue(assets.size() == count + 1);
		assertTrue(assets.contains(result));
	}

}
