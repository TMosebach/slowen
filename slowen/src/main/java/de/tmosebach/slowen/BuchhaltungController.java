package de.tmosebach.slowen;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.tmosebach.slowen.model.Konto;
import de.tmosebach.slowen.repository.KontoRepository;

@RestController
@RequestMapping("api")
@CrossOrigin
public class BuchhaltungController {

	private KontoRepository kontoRepository;

	public BuchhaltungController(KontoRepository kontoRepository) {
		this.kontoRepository = kontoRepository;
	}

	@GetMapping("konto")
	public Iterable<Konto> findAll() {
		return kontoRepository.findAll();
	}
	
	@PostMapping("konto")
	public Konto createKonto(@RequestBody Konto konto) {
		kontoRepository.save(konto);
		return konto;
	}
}
