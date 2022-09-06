package de.tmosebach.slowen.assets.api;

import java.util.List;

import javax.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.tmosebach.slowen.assets.Asset;
import de.tmosebach.slowen.assets.AssetService;

@RestController
@RequestMapping("api/v1/assets")
public class AssetController {

	private AssetService assetService;

	public AssetController(AssetService assetService) {
		this.assetService = assetService;
	}
	
	@PostMapping
	public Asset createAsset(@RequestBody @Valid CreateAssetRequest request) {
		return assetService.createAsset(request.getName(), request.getIsin(), request.getWpk());
	}
	
	@GetMapping
	public List<Asset> findAssets() {
		return assetService.findAssets();
	}
}
