package de.tmosebach.slowen.backend.restapapter;

import static java.util.Objects.nonNull;
import java.util.List;
import java.util.stream.Collectors;

import de.tmosebach.slowen.backend.domain.Asset;
import de.tmosebach.slowen.backend.domain.Buchung;
import de.tmosebach.slowen.backend.domain.Konto;
import de.tmosebach.slowen.backend.domain.Umsatz;

public class Api2DomainMapper {

	public static Buchung apiBuchung2Buchung(ApiBuchung apiBuchung) {
		Buchung buchung = new Buchung();
		buchung.setArt(apiBuchung.getArt());
		buchung.setDatum(apiBuchung.getDatum());
		buchung.setEmpfaenger(apiBuchung.getEmpfaenger());
		buchung.setBeschreibung(apiBuchung.getBeschreibung());
		buchung.setUmsaetze(apiUmsatzList2umsatzList(apiBuchung.getUmsaetze()));

		return buchung;
	}

	private static List<Umsatz> apiUmsatzList2umsatzList(List<ApiUmsatz> umsaetze) {
		return umsaetze.stream().map( apiUmsatz -> apiUmsatz2Umsatz(apiUmsatz)).collect(Collectors.toList());
	}

	private static Umsatz apiUmsatz2Umsatz(ApiUmsatz apiUmsatz) {
		Umsatz umsatz = new Umsatz();
		if (nonNull(apiUmsatz.getKonto())) {
			umsatz.setKonto(apiKontoToKonto(apiUmsatz.getKonto())); ;
		}
		umsatz.setValuta(apiUmsatz.getValuta());
		umsatz.setBetrag(apiUmsatz.getBetrag());
		if (nonNull(apiUmsatz.getAsset())) {
			umsatz.setAsset(apiAssetToAsset(apiUmsatz.getAsset()));
		}
		if (nonNull(apiUmsatz.getMenge())) {
			umsatz.setMenge(apiUmsatz.getMenge());
		}
		return umsatz;
	}

	public static Asset apiAssetToAsset(ApiAssetRef apiAssetRef) {
		Asset asset = new Asset();
		if (nonNull(apiAssetRef.getId())) {
			asset.setId( Long.valueOf(apiAssetRef.getId()) );
		}
		asset.setName(apiAssetRef.getName());
		return asset;
	}

	public static Konto apiKontoToKonto(ApiKontoRef apiKontoRef) {
		Konto konto = new Konto();
		if (nonNull(apiKontoRef.getId())) {
			konto.setId( Long.valueOf(apiKontoRef.getId()) );
		}
		konto.setName(apiKontoRef.getName());
		return konto;
	}
	
	public static Konto apiKontoToKonto(ApiKonto apiKonto) {
		Konto konto = new Konto();
		if (nonNull(apiKonto.getId())) {
			konto.setId( Long.valueOf(apiKonto.getId()) );
		}
		konto.setName(apiKonto.getName());
		return konto;
	}
}
