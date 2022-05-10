package de.tmosebach.slowen.backend.restapapter;

import static java.lang.Math.max;
import static java.lang.Math.min;
import static java.util.Arrays.asList;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

import java.net.URI;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedModel;
import org.springframework.hateoas.PagedModel.PageMetadata;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
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
	
	@GetMapping("buchungen/{id}")
	public PagedModel<ApiBuchung> getBuchungen4Konto(
			@PathVariable String id,
			@RequestParam(name = "page", defaultValue = "0") Long page, 
			@RequestParam(name = "size", defaultValue = "20") Long size) {
		LOG.debug("getBuchungen4Konto({})", id);
		
		Long kontoId = Long.parseLong(id);
		
		long buchungenCount = buchungService.countBuchungenByKonto(kontoId);
		List<Buchung> buchungen = buchungService.findBuchungenByKonto(kontoId, page, size);
		List<ApiBuchung> apiBuchungen = Domain2ApiMapper.buchungList2ApiBuchungList(buchungen);
		
		PageMetadata metadata = new PageMetadata(size, page, buchungenCount);
		PagedModel<ApiBuchung> resource =
				PagedModel.of(apiBuchungen, metadata, createLinks(id, metadata));
		
		return resource;
	}
	
	private Iterable<Link> createLinks(String id, PageMetadata page) {
		long current = page.getNumber();
		long totalPages = page.getTotalPages();
		long size = page.getSize();
		
		Link self = createLink("self", id, current, size);
		Link first = createLink("first", id, 1L, size);
		Link prev = createLink("prev", id, max(1L, current -1), size);
		Link next = createLink("next", id, min(current+1, totalPages), size);
		Link last = createLink("last", id, totalPages, size);
		
		return asList(self, first, prev, next, last);
	}


	private Link createLink(String name, String id, Long page, Long size) {
		return linkTo(methodOn(BuchhaltungController.class)
				.getBuchungen4Konto(id, page, size)
				)
				.withRel(name);
	}

	@GetMapping("konten/{id}")
	public ResponseEntity<ApiKonto> getKonto(@PathVariable String id) {
		
		LOG.debug("Lese Konto mit ID {}", id);
		
		Konto konto = buchungService.getKontoById(Long.parseLong(id));
		return ResponseEntity.ok(Domain2ApiMapper.konto2ApiKonto(konto));
	}
	
	@GetMapping("konten")
	public ResponseEntity<List<ApiKonto>> getKonten() {
		
		LOG.debug("Lese Konten.");
		
		List<Konto> kontorahmen = buchungService.getKontorahmen();
		return ResponseEntity.ok(Domain2ApiMapper.kontoList2ApiKontoList(kontorahmen));
	}
	
	@GetMapping("assets")
	public ResponseEntity<List<ApiAssetRef>> getAssets() {
		LOG.debug("Lese Assets.");
		
		Set<Asset> assetList = buchungService.getAssets();
		return ResponseEntity.ok(Domain2ApiMapper.assetList2ApiAssetList(assetList));
	}
}
