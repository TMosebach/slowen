package de.tmosebach.slowen.backend.restapapter.mapper;

import static java.util.Objects.*;
import java.util.List;
import java.util.stream.Collectors;

import de.tmosebach.slowen.backend.domain.Asset;
import de.tmosebach.slowen.backend.domain.Bankkonto;
import de.tmosebach.slowen.backend.domain.Bestand;
import de.tmosebach.slowen.backend.domain.BilanzTyp;
import de.tmosebach.slowen.backend.domain.Depot;
import de.tmosebach.slowen.backend.domain.Konto;
import de.tmosebach.slowen.backend.domain.Kreditkarte;
import de.tmosebach.slowen.backend.domain.Versicherung;
import de.tmosebach.slowen.backend.restapapter.ApiAsset;
import de.tmosebach.slowen.backend.restapapter.ApiBestand;
import de.tmosebach.slowen.backend.restapapter.ApiBilanzTyp;
import de.tmosebach.slowen.backend.restapapter.ApiKonto;
import de.tmosebach.slowen.backend.restapapter.ApiKontoTyp;

public class ToApiMapper {

	public static List<ApiKonto> kontoListToApiKontoList(List<Konto> kontoList) {
		return kontoList.stream()
				.map( konto -> kontoToApiKonto(konto))
				.collect(Collectors.toList());
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
				.collect(Collectors.toList());
	}

	private static ApiBestand bestandToApiBestand(Bestand bestand) {
		ApiBestand apiBestand = new ApiBestand();
		apiBestand.setId(idToString(bestand.getId()));
		apiBestand.setAsset(assetToApiAsset(bestand.getAsset()));
		apiBestand.setWert(bestand.getWert());
		apiBestand.setMenge(bestand.getMenge());
		return apiBestand;
	}

	private static ApiAsset assetToApiAsset(Asset asset) {
		ApiAsset apiAsset = new ApiAsset();
		apiAsset.setId(idToString(asset.getId()));
		apiAsset.setName(asset.getName());
		return apiAsset;
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
}
