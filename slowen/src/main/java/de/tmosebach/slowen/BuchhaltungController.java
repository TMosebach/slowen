package de.tmosebach.slowen;

import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import de.tmosebach.slowen.api.BuchungDto;
import de.tmosebach.slowen.api.KontoDto;
import de.tmosebach.slowen.apimapper.BuchungMapper;
import de.tmosebach.slowen.exception.IllegalDataException;
import de.tmosebach.slowen.exception.UnkownEntityException;
import de.tmosebach.slowen.model.Buchung;
import de.tmosebach.slowen.model.Konto;
import de.tmosebach.slowen.repository.KontoRepository;
import de.tmosebach.slowen.service.BuchungService;
import io.swagger.annotations.ApiResponses;
import io.swagger.annotations.ApiResponse;

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
	
	@GetMapping("/konto/{id}/buchungen")
	@ApiResponses(value = {
			@ApiResponse(code = 404, message = "Kein Konto mit der angegenben Id gefunden.")
		}
	)
	public @ResponseBody Page<BuchungDto> findBuchungenByKonto(
			@PathVariable Long id,
			@RequestParam(defaultValue = "0") Integer page,
			@RequestParam(defaultValue = "10") Integer size) throws UnkownEntityException {
		
		Optional<Konto> konto = kontoRepository.findById(id);
		if (konto.isEmpty()) {
			throw new ResponseStatusException(NOT_FOUND, "Unbekannte Konto-Id: "+id);
		}
		
		Pageable pageable = PageRequest.of(page, size);
		Page<Buchung> buchungPage = buchungService.findByKonto(konto.get().getName(), pageable);
		Page<BuchungDto> buchungDtoPage = 
				new PageImpl<>(
					buchungMapper.buchungsToBuchungDtos(buchungPage.getContent()),
					buchungPage.getPageable(), 
					buchungPage.getTotalElements());
		return buchungDtoPage;
	}
}
