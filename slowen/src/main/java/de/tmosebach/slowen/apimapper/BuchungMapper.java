package de.tmosebach.slowen.apimapper;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import de.tmosebach.slowen.api.BuchungDto;
import de.tmosebach.slowen.api.KontoDto;
import de.tmosebach.slowen.api.UmsatzDto;
import de.tmosebach.slowen.model.Buchung;
import de.tmosebach.slowen.model.Konto;
import de.tmosebach.slowen.model.KontoUmsatz;

@Component
public class BuchungMapper {

	public Buchung buchungDtoToBuchung(BuchungDto buchungDto) {
		
		Buchung buchung = new Buchung();
		buchung.setEmpfaenger(buchungDto.getEmpfaenger());
		buchung.setVerwendung(buchungDto.getVerwendung());
		buchung.setUmsaetze(kontoUmstzDtoTokontoUmsatz(buchungDto.getUmsaetze()));
		return buchung;
	}

	private List<KontoUmsatz> kontoUmstzDtoTokontoUmsatz(List<UmsatzDto> umsaetzeDto) {
		List<KontoUmsatz> umsaetze = new ArrayList<>();
		umsaetzeDto.forEach( umsatzDto -> umsaetze.add(kontoUmsatzDtoTokontoUmsatz(umsatzDto)));
		return umsaetze;
	}

	private KontoUmsatz kontoUmsatzDtoTokontoUmsatz(UmsatzDto umsatzDto) {
		KontoUmsatz umsatz = new KontoUmsatz();
		umsatz.setValuta(umsatzDto.getValuta());
		umsatz.setBetrag(umsatzDto.getBetrag());
		umsatz.setKonto(kontoDtoToKonto(umsatzDto.getKonto()));
		return umsatz;
	}

	private Konto kontoDtoToKonto(KontoDto kontoDto) {
		Konto konto = new Konto();
		konto.setName(kontoDto.getName());
		return konto;
	}

}
