package de.tmosebach.slowen.buchhaltung.api.mapper;

import static java.util.Objects.nonNull;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import de.tmosebach.slowen.buchhaltung.api.Asset;

@Component
public class AssetMapper {

	public List<Asset> domainAssetsToApiAssets(List<de.tmosebach.slowen.buchhaltung.model.Asset> domainAssets) {
		return domainAssets.stream()
				.map( domainAsset -> domainAssetToApiAsset(domainAsset))
				.collect(Collectors.toList());
	}
	
	public Asset domainAssetToApiAsset(de.tmosebach.slowen.buchhaltung.model.Asset domainAsset) {
		Asset apiAsset = new Asset();
		apiAsset.setId(Long.toString(domainAsset.getId()));
		apiAsset.setName(domainAsset.getName());
		apiAsset.setIsin(domainAsset.getIsin());
		apiAsset.setWpk(domainAsset.getWpk());
		return apiAsset;
	}

	public de.tmosebach.slowen.buchhaltung.model.Asset apiAssetToDomainAsset(Asset apiAsset) {
		de.tmosebach.slowen.buchhaltung.model.Asset domainAsset = new de.tmosebach.slowen.buchhaltung.model.Asset();
		domainAsset.setId(nonNull(apiAsset.getId())?Long.valueOf(apiAsset.getId()):null);
		domainAsset.setName(apiAsset.getName());
		domainAsset.setIsin(apiAsset.getIsin());
		domainAsset.setWpk(apiAsset.getWpk());
		return domainAsset;
	}
}
