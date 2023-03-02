package de.tmosebach.slowen.assets;

import java.util.List;

public interface AssetRepository {

	void save(Asset asset);

	List<Asset> findAssets();

}
