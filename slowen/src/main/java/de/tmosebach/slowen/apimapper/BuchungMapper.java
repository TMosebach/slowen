package de.tmosebach.slowen.apimapper;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import de.tmosebach.slowen.api.BuchungDto;
import de.tmosebach.slowen.api.KontoDto;
import de.tmosebach.slowen.api.KontoUmsatzDto;
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

	private List<KontoUmsatz> kontoUmstzDtoTokontoUmsatz(List<KontoUmsatzDto> umsaetzeDto) {
		List<KontoUmsatz> umsaetze = new ArrayList<>();
		umsaetzeDto.forEach( umsatzDto -> umsaetze.add(kontoUmsatzDtoTokontoUmsatz(umsatzDto)));
		return umsaetze;
	}

	private KontoUmsatz kontoUmsatzDtoTokontoUmsatz(KontoUmsatzDto umsatzDto) {
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

	public List<BuchungDto> buchungsToBuchungDtos(List<Buchung> content) {
		List<BuchungDto> dtos = new ArrayList<>();
		content.forEach( b -> dtos.add(buchungToBuchungDto(b)));
		return dtos;
	}

	public BuchungDto buchungToBuchungDto(Buchung b) {
		BuchungDto dto = new BuchungDto();
		dto.setId(Long.toString(b.getId()));
		dto.setEmpfaenger(b.getEmpfaenger());
		dto.setVerwendung(b.getVerwendung());
		dto.setUmsaetze(kontoUmsatzsTokontoUmsatzDtos(b.getUmsaetze()));
		return dto;
	}

	private List<KontoUmsatzDto> kontoUmsatzsTokontoUmsatzDtos(List<KontoUmsatz> umsaetze) {
		List<KontoUmsatzDto> dtos = new ArrayList<>();
		umsaetze.forEach( u -> dtos.add(kontoUmsatzTokontoUmsatzDto(u)));
		return dtos;
	}

	private KontoUmsatzDto kontoUmsatzTokontoUmsatzDto(KontoUmsatz u) {
		KontoUmsatzDto dto = new KontoUmsatzDto();
		dto.setBetrag(u.getBetrag());
		dto.setValuta(u.getValuta());
		dto.setKonto(kontoToKontoDto(u.getKonto()));
		return dto;
	}

	private KontoDto kontoToKontoDto(Konto konto) {
		return KontoDto.builder()
			.id(Long.toString(konto.getId()))
			.name(konto.getName())
			.saldo(konto.getSaldo())
			.build();
	}

}