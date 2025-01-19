package de.tmosebach.slowen.domain;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class AssetService {
	
	private Map<String, Asset> assets = new HashMap<>();

	public Optional<Asset> findAssetByIsin(String isin) {
		return Optional.ofNullable(assets.get(isin));
	}

	public void neuesAsset(Asset asset) {
		assets.put(asset.getIsin(), asset);
	}

	public List<Asset> getAssets() {
		return new ArrayList<>(assets.values());
	}
}
