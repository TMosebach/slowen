package de.tmosebach.slowen.konten.api;

import static java.util.Objects.isNull;

import java.util.List;
import java.util.Optional;

import javax.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import de.tmosebach.slowen.konten.Konto;
import de.tmosebach.slowen.konten.KontoService;

@RestController
@RequestMapping("api/v1")
public class KontoController {
	
	private KontoService kontoService;

	public KontoController(KontoService kontoService) {
		this.kontoService = kontoService;
	}
	
	@PostMapping("konten")
	public Konto createKonto(@RequestBody @Valid CreateKontoRequest request) {
		return kontoService.createKonto(request.getType(), request.getName(), request.getBilanzType());
	}

	@GetMapping("konten")
	public ResponseEntity<List<Konto>>  findKonten(@RequestParam(name = "name", required = false) String name) {
		if (isNull(name)) {
			return ResponseEntity.ok(kontoService.findKonten());
		}
		
		return findByName(name);
	}

	private ResponseEntity<List<Konto>>  findByName(String name) {
		Optional<Konto> foundKonto = kontoService.findByName(name);
		if (foundKonto.isPresent()) {
			return ResponseEntity.ok(List.of( foundKonto.get() ));
		}
		return ResponseEntity.notFound().build();
	}
}
