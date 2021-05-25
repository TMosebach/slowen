package de.tmosebach.slowen.buchhaltung;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;

import java.util.List;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.PagedModel;
import org.springframework.hateoas.PagedModel.PageMetadata;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import de.tmosebach.slowen.buchhaltung.api.Buchung;
import de.tmosebach.slowen.buchhaltung.api.Buchungstyp;
import de.tmosebach.slowen.buchhaltung.api.Depot;
import de.tmosebach.slowen.buchhaltung.api.Konto;
import de.tmosebach.slowen.buchhaltung.api.mapper.BuchungMapper;
import de.tmosebach.slowen.buchhaltung.api.mapper.KontoMapper;
import de.tmosebach.slowen.buchhaltung.model.BuchungService;
import de.tmosebach.slowen.buchhaltung.model.KontoService;
import de.tmosebach.slowen.exceptions.NichtEindeutigException;
import de.tmosebach.slowen.exceptions.UnkownEntityException;

@CrossOrigin
@RestController
@RequestMapping("api/buchhaltung")
public class BuchhaltungController {

	@Autowired
	private KontoMapper kontoMapper;
	
	@Autowired
	private KontoService kontoService;
	
	@Autowired
	private BuchungService buchungService;
	
	@Autowired
	private BuchungMapper buchungMapper;

	@GetMapping("konten")
	public CollectionModel<Konto> findAllKonten() {
		List<Konto> result = 
				kontoMapper.domainKontoListToApiKontoList(
						kontoService.findAll());
		return CollectionModel.of(result);
	}
	
	@GetMapping("konten/{kontoId}/umsatz")
	public PagedModel<Buchung> findKontoBuchungenByKontoName(@PathVariable("kontoId") String kontoId) {
		
		Long id = Long.valueOf(kontoId);
		
		long size = 10;
		long page = 1;
		long totalElements = buchungService.countKontoBuchungenByKonto(id);
		
		PageMetadata pageMetadata = new PageMetadata(size, page, totalElements);
		List<Buchung> content = buchungMapper.domainBuchungListToApiBuchungListe(
				buchungService.findKontoBuchungenByKonto(id, page, size));
		
		return PagedModel.of(content, pageMetadata);
	}
	
	@PostMapping("konten")
	public EntityModel<Konto> kontoAnlegen(@RequestBody @Valid  Konto konto) {		
		try {
			de.tmosebach.slowen.buchhaltung.model.Konto domainKonto =
					kontoMapper.apiKontoToDomainKonto(konto);
			domainKonto = kontoService.createKonto(domainKonto);
			return EntityModel.of(kontoMapper.domainKontoToApiKonto(domainKonto));
		} catch (DataIntegrityViolationException e) {
			throw new NichtEindeutigException(e.getMessage());
		}
	}
	
	@PostMapping("depots")
	public EntityModel<Konto> depotAnlegen(@RequestBody @Valid Depot depot) {
		try {
			de.tmosebach.slowen.buchhaltung.model.Depot domainDepot =
					kontoMapper.apiDepotToDomainDepot(depot);
			domainDepot = kontoService.createDepot(domainDepot);
			return EntityModel.of(kontoMapper.domainKontoToApiKonto(domainDepot));
		} catch (Exception e) {
			throw new NichtEindeutigException(e.getMessage());
		}
	}

	@PostMapping("buchungen")
	public ResponseEntity<?> buche(
			@RequestBody Buchung buchung,
			@RequestParam( name = "typ", defaultValue = "buchen")Buchungstyp typ) {

		try {
			Long buchungId = null;
			switch (typ) {
				case buchen:
				case kauf:
				case verkauf:
				case einnahme:
					buchungId = buchungService.buche(buchungMapper.apiBuchungToDomainBuchung(buchung));
					break;

			default:
				return ResponseEntity.badRequest().body("Unbekannter Buchungstyp: "+typ);
			}

			return ResponseEntity.created(
						linkTo(BuchhaltungController.class, buchungId).toUri())
					.build();
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(e.getMessage());
		} catch (UnkownEntityException e) {
			return ResponseEntity.notFound().build();
		}
	}
}
