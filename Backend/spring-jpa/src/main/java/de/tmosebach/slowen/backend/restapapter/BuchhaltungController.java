package de.tmosebach.slowen.backend.restapapter;

import java.net.URI;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.tmosebach.slowen.backend.domain.Buchung;
import de.tmosebach.slowen.backend.domain.Konto;
import de.tmosebach.slowen.backend.domain.Asset;
import de.tmosebach.slowen.backend.domain.BuchhaltungService;

@RestController
@CrossOrigin
@RequestMapping("api/buchhaltung")
public class BuchhaltungController {
	
	private static final Logger LOG = LoggerFactory.getLogger(BuchhaltungController.class);
	
	private BuchhaltungService buchungService;

	public BuchhaltungController(BuchhaltungService buchungService) {
		this.buchungService = buchungService;
	}

	@PostMapping("buchungen")
	public ResponseEntity<ApiBuchung> buche(@RequestBody ApiBuchung apiBuchung) {
		Buchung buchung = Api2DomainMapper.apiBuchung2Buchung(apiBuchung);
		buchung = buchungService.buche(buchung);
		return ResponseEntity
				.created(URI.create("api/buchhaltung/buchung/"+buchung.hashCode()))
				.body(Domain2ApiMapper.buchung2ApiBuchung(buchung));
	}
	
	@GetMapping("buchungen/{name}")
	public ResponseEntity<List<ApiBuchung>> getBuchungen4Konto(@PathVariable String name) {
		LOG.debug("getBuchungen4Konto({})", name);
		
		List<Buchung> buchungen = buchungService.findBuchungenByKontoname(name);
		
		return ResponseEntity.ok(Domain2ApiMapper.buchungList2ApiBuchungList(buchungen));
	}
	
	@GetMapping("konten")
	public ResponseEntity<List<ApiKonto>> getKonten() {
		
		LOG.debug("Lese Konten.");
		
		List<Konto> kontorahmen = buchungService.getKontorahmen();
		return ResponseEntity.ok(Domain2ApiMapper.kontoList2ApiKontoList(kontorahmen));
	}
	
	@GetMapping("assets")
	public ResponseEntity<List<ApiAsset>> getAssets() {
		LOG.debug("Lese Assets.");
		
		Set<Asset> assetList = buchungService.getAssets();
		return ResponseEntity.ok(Domain2ApiMapper.assetList2ApiAssetList(assetList));
	}
}
