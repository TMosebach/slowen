package de.tmosebach.slowen.backend.restapapter;

import java.net.URI;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.tmosebach.slowen.backend.domain.BuchhaltungService;
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
	public ApiBuchung buchen(ApiBuchung buchung) {
		throw new UnsupportedOperationException();
	}

	@GetMapping("buchungen/konto/{id}")
	public Page<ApiBuchung> findBuchungenByKonto(Long id, int number, int size) {
		throw new UnsupportedOperationException();
	}

	@PostMapping("assets")
	public ApiAsset neuesAsset(ApiAsset asset) {
		throw new UnsupportedOperationException();
	}

	@GetMapping("assets")
	public List<ApiAsset> findAssets() {
		throw new UnsupportedOperationException();
	}
}
