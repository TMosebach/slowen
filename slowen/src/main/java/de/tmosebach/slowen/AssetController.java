package de.tmosebach.slowen;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.tmosebach.slowen.model.Asset;
import de.tmosebach.slowen.repository.AssetRepository;

@RestController
@RequestMapping("api")
@CrossOrigin
public class AssetController {
	
	private AssetRepository assetRepository;

	public AssetController(AssetRepository assetRepository) {
		this.assetRepository = assetRepository;
	}

	@GetMapping("asset")
	public Iterable<Asset> findAllAssets() {
		return assetRepository.findAll();
	}
	
	@PostMapping("asset")
	public Asset createAsset(@RequestBody Asset asset) {
		
		assetRepository.save(asset);

		return asset;
	}
}
