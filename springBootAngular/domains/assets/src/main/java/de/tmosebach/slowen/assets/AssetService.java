package de.tmosebach.slowen.assets;

import static de.tmosebach.slowen.shared.values.Functions.createId;
import static org.apache.commons.lang3.StringUtils.isBlank;

import java.util.List;

import org.springframework.stereotype.Service;

import de.tmosebach.slowen.shared.values.AssetIdentifier;

@Service
public class AssetService {
	
	private AssetRepository assetRepository;

	public AssetService(AssetRepository assetRepository) {
		this.assetRepository = assetRepository;
	}

	public Asset createAsset(String name, String isin, String wpk) {
		if (isBlank(name)) {
			throw new IllegalArgumentException("Name fehlt.");
		}
		
		String id = createId();
		AssetIdentifier identifier = new AssetIdentifier(id);
		Asset asset = new Asset(identifier, name);
		asset.setIsin(isin);
		asset.setWpk(wpk);
	
		assetRepository.save(asset);
		
		return asset;
	}

	public List<Asset> findAssets() {
		return assetRepository.findAssets();
	}
}
