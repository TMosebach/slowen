package de.tmosebach.slowen.buchhaltung.api;

import static java.util.Objects.isNull;

import java.time.LocalDate;

import javax.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.tmosebach.slowen.buchhaltung.Buchung;
import de.tmosebach.slowen.buchhaltung.BuchungService;
import de.tmosebach.slowen.buchhaltung.api.model.BucheRequest;
import de.tmosebach.slowen.buchhaltung.api.model.BucheResponse;
import de.tmosebach.slowen.buchhaltung.api.model.KaufRequest;
import de.tmosebach.slowen.buchhaltung.api.model.VerkaufRequest;
import de.tmosebach.slowen.buchhaltung.builder.BuchungBuilder;
import de.tmosebach.slowen.buchhaltung.builder.KaufBuilder;
import de.tmosebach.slowen.buchhaltung.builder.VerkaufBuilder;
import de.tmosebach.slowen.shared.values.AssetIdentifier;
import de.tmosebach.slowen.shared.values.Betrag;
import de.tmosebach.slowen.shared.values.KontoIdentifier;
import de.tmosebach.slowen.shared.values.Waehrung;

@RestController
@RequestMapping("api/v1")
public class BuchhaltungController {
	
	private BuchungService buchungService;

	public BuchhaltungController(BuchungService buchungService) {
		this.buchungService = buchungService;
	}

	@PostMapping("buchungen/buchung")
	public BucheResponse buche(@RequestBody @Valid BucheRequest request) {
		
		LocalDate buchungsDatum = 
			isNull(request.getBuchungsDatum())?
					LocalDate.now():
						request.getBuchungsDatum();
		BuchungBuilder builder = 
			new BuchungBuilder(buchungsDatum)
			.buchung()
			.verwendung(request.getVerwendung())
			.empfaenger(request.getEmpfaenger());
		
		request.getKontoBuchungen().forEach( 
			kontoBuchung -> 
				builder.umsatz(
				 	new KontoIdentifier(kontoBuchung.getKonto()), 
					isNull(kontoBuchung.getValuta())?
							buchungsDatum:
								kontoBuchung.getValuta(),
					new Betrag(
						kontoBuchung.getBetrag(), 
						Waehrung.valueOf(kontoBuchung.getWaehrung()))) );
		
		Buchung buchung = buchungService.buche(builder.build());
		
		return ToApiMapper.map(buchung);
	}
	
	@PostMapping("buchungen/kauf")
	public BucheResponse buche(@RequestBody @Valid KaufRequest request) {
		
		LocalDate buchungsDatum = 
			isNull(request.getBuchungsDatum())?
					LocalDate.now():
						request.getBuchungsDatum();
		KaufBuilder builder = 
			new KaufBuilder(buchungsDatum)
			.kauf( new AssetIdentifier(request.getAsset()) )
			.verwendung(request.getVerwendung())
			.empfaenger(request.getEmpfaenger())
			.insDepot(new KontoIdentifier(request.getDepot()))
			.menge(request.getMenge())
			.kurs(request.getKurs())
			.zuLasten(new KontoIdentifier(request.getVerrechnungskonto()));
		
		request.getGebuehren().forEach(
			kontoBuchung -> 
				builder.gebuehr(
				 	new KontoIdentifier(kontoBuchung.getKonto()), 
					new Betrag(
						kontoBuchung.getBetrag(), 
						Waehrung.valueOf(kontoBuchung.getWaehrung()))) );
		
		Buchung buchung = buchungService.buche(builder.build());
		
		return ToApiMapper.map(buchung);
	}
	
	@PostMapping("buchungen/verkauf")
	public BucheResponse buche(@RequestBody @Valid VerkaufRequest request) {
		
		LocalDate buchungsDatum = 
			isNull(request.getBuchungsDatum())?
					LocalDate.now():
						request.getBuchungsDatum();
		VerkaufBuilder builder = 
				new VerkaufBuilder(buchungsDatum)
				.verkauf(new AssetIdentifier(request.getAsset()))
				.ausDepot(new KontoIdentifier(request.getDepot()))
				.menge(request.getMenge())
				.kurs(request.getKurs())
				.zuGunsten(new KontoIdentifier(request.getVerrechnungskonto()));
		
		request.getGebuehren().forEach(
			kontoBuchung -> 
				builder.gebuehr(
				 	new KontoIdentifier(kontoBuchung.getKonto()), 
					new Betrag(
						kontoBuchung.getBetrag(), 
						Waehrung.valueOf(kontoBuchung.getWaehrung()))) );
		
		Buchung buchung = buchungService.buche(builder.build());
		
		return ToApiMapper.map(buchung);
	}
}