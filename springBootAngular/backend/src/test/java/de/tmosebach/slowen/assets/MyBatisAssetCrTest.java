package de.tmosebach.slowen.assets;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;

@MybatisTest(properties = { "mybatis.mapper-locations=classpath*:mappings/*.xml" })
public class MyBatisAssetCrTest {

	@Autowired
	private MyBatisAssetRepository assetRepository;
	
	@Test
	void testSaveKonto() {
		List<Asset> result = assetRepository.findAssets();
		int countVorher = result.size();
		
		Asset asset = new Asset("id", "name", "isin56789012", "wpk000");
		
		assetRepository.save(asset);
		
		result = assetRepository.findAssets();
		assertEquals(countVorher + 1, result.size());
	}
}
