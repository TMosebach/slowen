package de.tmosebach.slowen.buchhaltung;

import java.util.ArrayList;
import java.util.List;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.CollectionModel;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.tmosebach.slowen.buchhaltung.api.Asset;
import de.tmosebach.slowen.buchhaltung.api.mapper.AssetMapper;
import de.tmosebach.slowen.buchhaltung.model.AssetsRepository;

@CrossOrigin
@RestController
@RequestMapping("api/assets")
public class AssetsController {

	@Autowired
	private AssetsRepository assetsRepository;
	
	@Autowired
	private AssetMapper assetMapper;
	
	@GetMapping
	public CollectionModel<Asset> findAll() {
		List<Asset> result = new ArrayList<>();
		assetsRepository.findAll().forEach( a -> result.add(assetMapper.domainAssetToApiAsset(a)) );
		return CollectionModel.of(result);
	}
	
	@PostMapping
	@Transactional
	public Asset assetAnlegen(@RequestBody Asset asset) {
		de.tmosebach.slowen.buchhaltung.model.Asset domainAsset = assetMapper.apiAssetToDomainAsset(asset);
		assetsRepository.save(domainAsset);
		return assetMapper.domainAssetToApiAsset(domainAsset);
	}
}
