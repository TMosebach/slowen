package de.tmosebach.slowen.api;

import java.util.List;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import de.tmosebach.slowen.api.types.Asset;
import de.tmosebach.slowen.api.types.Konto;
import de.tmosebach.slowen.domain.AssetService;
import de.tmosebach.slowen.domain.KontoService;

@Controller
public class QueryController {
	
	private KontoService kontoService;
	private AssetService assetService;
	
	public QueryController(
		KontoService kontoService,
		AssetService assetService) {
		this.kontoService = kontoService;
		this.assetService = assetService;
	}

	@QueryMapping
	public List<Asset> assets() {
		return assetService.getAssets().stream()
				.map( domainAsset -> {
					Asset asset = new Asset();
					asset.setIsin(domainAsset.getIsin());
					asset.setTyp(domainAsset.getTyp());
					asset.setName(domainAsset.getName());
					asset.setWpk(domainAsset.getWpk());
					return asset;
				}).toList();
	}
	
	@QueryMapping
	public List<String> buchungen(String konto) {
		return List.of();
	}

	@QueryMapping
	public Konto findKontoByName(@Argument String kontoName) {
		de.tmosebach.slowen.domain.Konto konto = kontoService.findByName(kontoName).orElseThrow();
		
		Konto result = new Konto();
		result.setName(konto.getName());
		result.setArt(konto.getArt());
		result.setBilanzPosition(konto.getBilanzPosition());
		result.setWaehrung(konto.getWaehrung());
		
		return result;
	}
}
