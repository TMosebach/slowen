package de.tmosebach.slowen.api;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;

import de.tmosebach.slowen.api.input.AssetInput;
import de.tmosebach.slowen.domain.AssetService;
import de.tmosebach.slowen.values.AssetTyp;

@SpringBootTest
@Sql({"clearDB.sql"})
class AssetAnlageTest {
	
	private static final String ISIN = "DE0008032001";
	private static final String WPK = "803200";
	
	@Autowired
	private MutationController impl;
	
	@Autowired
	private AssetService assetService;
	
	@Test
	void testKontoanlage() {
		assertTrue(assetService.findAssetByIsin(ISIN).isEmpty());
		
		AssetInput assetInput = new AssetInput();
		assetInput.setName("Commerzbank AG");
		assetInput.setIsin(ISIN);
		assetInput.setWpk(WPK);
		assetInput.setTyp(AssetTyp.Aktie);
		
		impl.neuesAsset(assetInput);
		
		assertTrue(assetService.findAssetByIsin(ISIN).isPresent());
	}
}
