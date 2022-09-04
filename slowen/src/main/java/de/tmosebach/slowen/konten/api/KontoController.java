package de.tmosebach.slowen.konten.api;

import static java.util.Objects.isNull;

import java.util.List;

import javax.validation.Valid;

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
	public List<Konto> findKonten(@RequestParam(name = "name", required = false) String name) {
		if (isNull(name)) {
			return kontoService.findKonten();
		}
		return kontoService.findByName(name);
	}
}
