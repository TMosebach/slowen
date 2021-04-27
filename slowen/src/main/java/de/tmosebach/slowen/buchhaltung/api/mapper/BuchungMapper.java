package de.tmosebach.slowen.buchhaltung.api.mapper;

import static java.util.Objects.nonNull;
import static java.util.stream.Collectors.toList;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import de.tmosebach.slowen.buchhaltung.api.Buchung;
import de.tmosebach.slowen.buchhaltung.api.Konto;
import de.tmosebach.slowen.buchhaltung.api.Umsatz;
import de.tmosebach.slowen.buchhaltung.model.DepotUmsatz;

@Component
public class BuchungMapper {
	
	@Autowired
	private AssetMapper assetMapper;

	public List<Buchung> domainBuchungListToApiBuchungListe(List<de.tmosebach.slowen.buchhaltung.model.Buchung> domainBuchungen) {
		return domainBuchungen.stream()
				.map( domainBuchung -> domainBuchungToApiBuchung(domainBuchung))
				.collect(toList());
	}

	private Buchung domainBuchungToApiBuchung(de.tmosebach.slowen.buchhaltung.model.Buchung domainBuchung) {
		Buchung apiBuchung = new Buchung();
		apiBuchung.setId(Long.toString(domainBuchung.getId()));
		apiBuchung.setEmpfaenger(domainBuchung.getEmpfaenger());
		apiBuchung.setVerwendung(domainBuchung.getVerwendung());
		apiBuchung.setUmsaetze(domainUmsatzListToApiUmsatzList(domainBuchung.getUmsaetze()));
		return apiBuchung;
	}

	private List<Umsatz> domainUmsatzListToApiUmsatzList(List<de.tmosebach.slowen.buchhaltung.model.KontoUmsatz> domainUmsaetze) {
		return domainUmsaetze.stream()
				.map( domainUmsatz -> domainUmsatzToApiUmsatz(domainUmsatz))
				.collect(toList());
	}

	private Umsatz domainUmsatzToApiUmsatz(de.tmosebach.slowen.buchhaltung.model.KontoUmsatz domainUmsatz) {
		Umsatz apiUmsatz = new Umsatz();
		if (domainUmsatz instanceof DepotUmsatz) {
			DepotUmsatz depotUmsatz = (DepotUmsatz)domainUmsatz;
			apiUmsatz.setAsset(assetMapper.domainAssetToApiAsset(depotUmsatz.getAsset()));
			apiUmsatz.setMenge(depotUmsatz.getMenge());
		}
		apiUmsatz.setBetrag(domainUmsatz.getBetrag());
		apiUmsatz.setValuta(domainUmsatz.getValuta());
		apiUmsatz.setKonto(domainKontoToApiKonto(domainUmsatz.getKonto()));
		return apiUmsatz;
	}

	private Konto domainKontoToApiKonto(de.tmosebach.slowen.buchhaltung.model.Konto domainKonto) {
		Konto apiKonto = new Konto();
		apiKonto.setId(Long.toString(domainKonto.getId()));
		apiKonto.setName(domainKonto.getName());
		apiKonto.setArt(domainKonto.getArt());
		apiKonto.setSaldo(domainKonto.getSaldo());
		return apiKonto;
	}

	public de.tmosebach.slowen.buchhaltung.model.Buchung apiBuchungToDomainBuchung(Buchung apiBuchung) {
		de.tmosebach.slowen.buchhaltung.model.Buchung domainBuchung = new de.tmosebach.slowen.buchhaltung.model.Buchung();
		domainBuchung.setId(nonNull(apiBuchung.getId())?Long.valueOf(apiBuchung.getId()):null);
		domainBuchung.setEmpfaenger(apiBuchung.getEmpfaenger());
		domainBuchung.setVerwendung(apiBuchung.getVerwendung());
		domainBuchung.setUmsaetze(apiUmsaetzeToDomainUmsaetze(apiBuchung.getUmsaetze()));
		return domainBuchung;
	}

	private List<de.tmosebach.slowen.buchhaltung.model.KontoUmsatz> apiUmsaetzeToDomainUmsaetze(List<Umsatz> apiUmsaetze) {
		return apiUmsaetze.stream()
				.map( apiUmsatz -> apiUmsatzToDomainUmsatz(apiUmsatz))
				.collect(toList());
	}

	private de.tmosebach.slowen.buchhaltung.model.KontoUmsatz apiUmsatzToDomainUmsatz(Umsatz apiUmsatz) {
		de.tmosebach.slowen.buchhaltung.model.KontoUmsatz domainUmsatz = null;
		if (nonNull(apiUmsatz.getAsset())) {
			de.tmosebach.slowen.buchhaltung.model.DepotUmsatz domainDepotUmsatz = 
					new de.tmosebach.slowen.buchhaltung.model.DepotUmsatz();
			domainDepotUmsatz.setMenge(apiUmsatz.getMenge());
			domainDepotUmsatz.setAsset(assetMapper.apiAssetToDomainAsset(apiUmsatz.getAsset()));
			domainUmsatz = domainDepotUmsatz;
		} else {
			domainUmsatz = new de.tmosebach.slowen.buchhaltung.model.KontoUmsatz();
		}
		
		domainUmsatz.setBetrag(apiUmsatz.getBetrag());
		domainUmsatz.setValuta(apiUmsatz.getValuta());
		domainUmsatz.setKonto(apiKontoToDomainKonto(apiUmsatz.getKonto()));
		return domainUmsatz;
	}

	private de.tmosebach.slowen.buchhaltung.model.Konto apiKontoToDomainKonto(Konto apiKonto) {
		de.tmosebach.slowen.buchhaltung.model.Konto domainKonto = new de.tmosebach.slowen.buchhaltung.model.Konto();
		domainKonto.setId(nonNull(apiKonto.getId())?Long.valueOf(apiKonto.getId()):null);
		domainKonto.setName(apiKonto.getName());
		domainKonto.setArt(apiKonto.getArt());
		domainKonto.setSaldo(apiKonto.getSaldo());
		return domainKonto;
	}
}
