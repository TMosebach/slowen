package de.tmosebach.slowen.backend.restapapter;

import java.net.URI;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import de.tmosebach.slowen.backend.domain.Asset;
import de.tmosebach.slowen.backend.domain.BuchhaltungService;
import de.tmosebach.slowen.backend.domain.Buchung;
import de.tmosebach.slowen.backend.domain.Konto;
import de.tmosebach.slowen.backend.restapapter.mapper.ToApiMapper;
import de.tmosebach.slowen.backend.restapapter.mapper.ToDomainMapper;

@RestController
@RequestMapping("api/buchhaltung")
public class BuchhaltungController {
	
	private BuchhaltungService service;

	public BuchhaltungController(BuchhaltungService service) {
		this.service = service;
	}

	@GetMapping("konten")
	public ResponseEntity<List<ApiKonto>> findKonten() {
		return ResponseEntity.ok(
				ToApiMapper.kontoListToApiKontoList(
						service.findKonten()));
	}

	@PostMapping("konten")
	public ResponseEntity<ApiKonto> kontoAnlegen(@RequestBody ApiKonto apiKonto) {
		Konto konto = service.kontoAnlegen(ToDomainMapper.apiKontoToKonto(apiKonto));
		
		return ResponseEntity
				.created(URI.create("api/buchhaltung/konten/"+konto.getId()))
				.body(ToApiMapper.kontoToApiKonto(konto));
	}

	@PostMapping("buchungen")
	public ResponseEntity<ApiBuchung> buchen(@RequestBody ApiBuchung apiBuchung) {
		Buchung buchung = service.buchen(ToDomainMapper.apiBuchungToBuchung(apiBuchung));
		
		return ResponseEntity
				.created(URI.create("api/buchhaltung/buchungen/"+buchung.getId()))
				.body(ToApiMapper.buchungToApiBuchung(buchung));
	}

	@GetMapping("buchungen/konto/{id}")
	public Page<ApiBuchung> findBuchungenByKonto(
			@PathVariable Long id, 
			@RequestParam(name = "number", defaultValue = "1") int number,
			@RequestParam(name = "size", defaultValue = "20") int size) {
		
		// TODO Page ins Lib-neutrale Model übernehmen
		Pageable pageable = PageRequest.of((int)number, (int)size);
		Page<Buchung> page = service.findBuchungenByKonto(id, number, size);
		List<ApiBuchung> content = 
			ToApiMapper.buchungListToApiList(
					page.getContent());
		return new PageImpl<>(content, pageable, page.getTotalElements());
	}

	@PostMapping("assets")
	public ResponseEntity<ApiAsset> neuesAsset(@RequestBody ApiAsset apiAsset) {
		Asset asset = service.assetAnlegen(ToDomainMapper.apiAssetToAsset(apiAsset));
		
		return ResponseEntity
				.created(URI.create("api/buchhaltung/assets/"+asset.getId()))
				.body(ToApiMapper.assetToApiAsset(asset));
	}

	@GetMapping("assets")
	public ResponseEntity<List<ApiAsset>> findAssets() {
		return ResponseEntity.ok(
				ToApiMapper.assetListToApiAssetlist(
						service.findAssets()));
	}
}
