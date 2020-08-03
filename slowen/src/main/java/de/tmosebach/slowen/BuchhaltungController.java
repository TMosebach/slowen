package de.tmosebach.slowen;

import java.util.ArrayList;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.tmosebach.slowen.api.BuchungDto;
import de.tmosebach.slowen.api.KontoDto;
import de.tmosebach.slowen.apimapper.BuchungMapper;
import de.tmosebach.slowen.exception.IllegalDataException;
import de.tmosebach.slowen.exception.UnkownEntityException;
import de.tmosebach.slowen.model.Buchung;
import de.tmosebach.slowen.model.Konto;
import de.tmosebach.slowen.repository.KontoRepository;
import de.tmosebach.slowen.service.BuchungService;

@RestController
@RequestMapping("api")
@CrossOrigin
public class BuchhaltungController {

	private KontoRepository kontoRepository;
	private BuchungMapper buchungMapper;
	private BuchungService buchungService;

	public BuchhaltungController(
			KontoRepository kontoRepository,
			BuchungMapper buchungMapper,
			BuchungService buchungService) {
		this.kontoRepository = kontoRepository;
		this.buchungMapper = buchungMapper;
		this.buchungService = buchungService;
	}

	@GetMapping("konto")
	public Iterable<KontoDto> findAll() {
		final List<KontoDto> konten = new ArrayList<>();
		kontoRepository.findAll().forEach( k -> {
			konten.add(
				KontoDto.builder()
				.id(Long.toString(k.getId()))
				.name(k.getName())
				.art(k.getArt().name())
				.saldo(k.getSaldo())
				.build()
			);
		});
		return konten;
	}
	
	@PostMapping("konto")
	public Konto createKonto(@RequestBody Konto konto) {
		kontoRepository.save(konto);
		return konto;
	}
	
	@PostMapping("buchung")
	public BuchungDto createKonto(@RequestBody BuchungDto buchungDto) throws UnkownEntityException, IllegalDataException {
		
		Buchung buchung = buchungMapper.buchungDtoToBuchung(buchungDto);
		Buchung result = buchungService.buche(buchung);
		
		buchungDto.setId(Long.toString(result.getId()));

		return buchungDto;
	}
}
