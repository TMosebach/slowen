package de.tmosebach.slowen.backend.restapapter.mapper;

import static java.util.stream.Collectors.toList;
import static java.util.Objects.*;
import java.util.List;

import de.tmosebach.slowen.backend.domain.Asset;
import de.tmosebach.slowen.backend.domain.Bankkonto;
import de.tmosebach.slowen.backend.domain.Bestand;
import de.tmosebach.slowen.backend.domain.BilanzTyp;
import de.tmosebach.slowen.backend.domain.Buchung;
import de.tmosebach.slowen.backend.domain.BuchungArt;
import de.tmosebach.slowen.backend.domain.Depot;
import de.tmosebach.slowen.backend.domain.Konto;
import de.tmosebach.slowen.backend.domain.Kreditkarte;
import de.tmosebach.slowen.backend.domain.Page;
import de.tmosebach.slowen.backend.domain.Umsatz;
import de.tmosebach.slowen.backend.domain.Versicherung;
import de.tmosebach.slowen.backend.restapapter.ApiAsset;
import de.tmosebach.slowen.backend.restapapter.ApiBestand;
import de.tmosebach.slowen.backend.restapapter.ApiBilanzTyp;
import de.tmosebach.slowen.backend.restapapter.ApiBuchung;
import de.tmosebach.slowen.backend.restapapter.ApiBuchungArt;
import de.tmosebach.slowen.backend.restapapter.ApiKonto;
import de.tmosebach.slowen.backend.restapapter.ApiKontoTyp;
import de.tmosebach.slowen.backend.restapapter.ApiPage;
import de.tmosebach.slowen.backend.restapapter.ApiUmsatz;

public class ToApiMapper {

	public static List<ApiKonto> kontoListToApiKontoList(List<Konto> kontoList) {
		return kontoList.stream()
				.map( konto -> kontoToApiKonto(konto))
				.collect(toList());
	}

	public static ApiKonto kontoToApiKonto(Konto konto) {
		ApiKonto apiKonto = new ApiKonto();
		apiKonto.setId(idToString(konto.getId()));
		apiKonto.setName(konto.getName());
		apiKonto.setBilanzTyp(bilanzTypToApiBilanzTyp(konto.getBilanzTyp()));
		apiKonto.setSaldo(konto.getSaldo());
		
		ApiKontoTyp kontoTyp = getApiKontoTyp(konto);
		apiKonto.setTyp(kontoTyp);
		
		switch (kontoTyp) {
		case Konto:
			// schon alle Daten gesetzt.
			break;
		case Bankkonto:
			Bankkonto bankkonto = (Bankkonto)konto;
			apiKonto.setIban(bankkonto.getIban());
			apiKonto.setBic(bankkonto.getBic());
			apiKonto.setBank(bankkonto.getBank());
			break;
			
		case Depot:
			Depot depot = (Depot)konto;
			apiKonto.setNummer(depot.getNummer());
			apiKonto.setBestaende(bestandListeToApiBestandListe(depot.getBestaende()));
			break;
			
		case Kreditkarte:
			Kreditkarte kreditkarte = (Kreditkarte)konto;
			apiKonto.setNummer(kreditkarte.getNummer());
			apiKonto.setGueltigBis(kreditkarte.getGueltigBis());
			break;
			
		case Versicherung:
			Versicherung versicherung = (Versicherung)konto;
			apiKonto.setNummer(versicherung.getNummer());
			break;

		default:
			throw new IllegalArgumentException("Unbekannter Kontotyp "+konto.getClass().getSimpleName());
		}
		return apiKonto;
	}

	private static String idToString(Long id) {
		if (isNull(id)) {
			return null;
		}
		return Long.toString(id);
	}

	private static List<ApiBestand> bestandListeToApiBestandListe(List<Bestand> bestaende) {
		return bestaende.stream()
				.map( bestand -> bestandToApiBestand(bestand))
				.collect(toList());
	}

	private static ApiBestand bestandToApiBestand(Bestand bestand) {
		ApiBestand apiBestand = new ApiBestand();
		apiBestand.setId(idToString(bestand.getId()));
		apiBestand.setAsset(assetToApiAsset(bestand.getAsset()));
		apiBestand.setWert(bestand.getWert());
		apiBestand.setMenge(bestand.getMenge());
		return apiBestand;
	}

	public static ApiAsset assetToApiAsset(Asset asset) {
		if (nonNull(asset)) {
			ApiAsset apiAsset = new ApiAsset();
			apiAsset.setId(idToString(asset.getId()));
			apiAsset.setName(asset.getName());
			return apiAsset;
		}
		return null;
	}

	private static ApiKontoTyp getApiKontoTyp(Konto konto) {
		if (konto instanceof Bankkonto) {
			return ApiKontoTyp.Bankkonto;
		}
		if (konto instanceof Depot) {
			return ApiKontoTyp.Depot;
		}
		if (konto instanceof Kreditkarte) {
			return ApiKontoTyp.Kreditkarte;
		}
		if (konto instanceof Versicherung) {
			return ApiKontoTyp.Versicherung;
		}
		return ApiKontoTyp.Konto;
	}

	private static ApiBilanzTyp bilanzTypToApiBilanzTyp(BilanzTyp bilanzTyp) {
		if (isNull(bilanzTyp)) {
			return null;
		}
		return ApiBilanzTyp.valueOf(bilanzTyp.toString());
	}

	public static List<ApiAsset> assetListToApiAssetlist(List<Asset> assetList) {
		return assetList.stream()
				.map( asset -> assetToApiAsset(asset))
				.collect(toList());
	}

	public static List<ApiBuchung> buchungListToApiList(List<Buchung> buchungList) {
		return buchungList.stream()
				.map( buchung -> buchungToApiBuchung(buchung))
				.collect(toList());
	}
	
	public static ApiBuchung buchungToApiBuchung(Buchung buchung) {
		ApiBuchung apiBuchung = new ApiBuchung();
		apiBuchung.setArt(buchungArtToApiBuchungArt(buchung.getArt()));
		apiBuchung.setEmpfaenger(buchung.getEmpfaenger());
		apiBuchung.setId(idToString(buchung.getId()));
		apiBuchung.setVerwendung(buchung.getVerwendung());
		
		apiBuchung.setUmsaetze(umsatzListToApiUmsatzListe(buchung.getUmsaetze()));
		
		return apiBuchung;
	}

	private static List<ApiUmsatz> umsatzListToApiUmsatzListe(List<Umsatz> umsatzList) {
		return umsatzList.stream()
				.map( umsatz -> umsatzToApiUmsatz(umsatz) )
				.collect(toList());
	}

	private static ApiUmsatz umsatzToApiUmsatz(Umsatz umsatz) {
		ApiUmsatz apiUmsatz = new ApiUmsatz();
		apiUmsatz.setAsset(assetToApiAsset(umsatz.getAsset()));
		apiUmsatz.setBetrag(umsatz.getBetrag());
		apiUmsatz.setId(idToString(umsatz.getId()));
		apiUmsatz.setKonto(kontoToApiKontoRef(umsatz.getKonto()));
		apiUmsatz.setMenge(umsatz.getMenge());
		apiUmsatz.setValuta(umsatz.getValuta());
		return apiUmsatz;
	}

	private static ApiKonto kontoToApiKontoRef(Konto konto) {
		ApiKonto apiKonto = new ApiKonto();
		apiKonto.setId(idToString(konto.getId()));
		apiKonto.setName(konto.getName());
		return apiKonto;
	}

	private static ApiBuchungArt buchungArtToApiBuchungArt(BuchungArt art) {
		if (nonNull(art)) {
			return ApiBuchungArt.valueOf(art.toString());
		}
		return null;
	}

	public static ApiPage<ApiBuchung> pageToApiPage(Page<Buchung> page) {
		return new ApiPage<>(
				ToApiMapper.buchungListToApiList(page.getContent()),
				page.getTotalPages(),
				page.getTotalElements(),
				page.getSize(),
				page.getNumber());
	}
}
