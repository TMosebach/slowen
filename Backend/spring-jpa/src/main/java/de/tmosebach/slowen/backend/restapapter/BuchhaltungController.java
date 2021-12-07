package de.tmosebach.slowen.backend.restapapter;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/buchhaltung")
public class BuchhaltungController {

	@GetMapping("konten")
	public List<ApiKonto> findKonten() {
		throw new UnsupportedOperationException();
	}

	@PostMapping("konten")
	public ApiKonto kontoAnlegen(ApiKonto konto) {
		throw new UnsupportedOperationException();
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
