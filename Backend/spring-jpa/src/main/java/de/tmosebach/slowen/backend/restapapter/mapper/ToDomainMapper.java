package de.tmosebach.slowen.backend.restapapter.mapper;

import static java.util.Objects.*;
import static java.util.stream.Collectors.toList;

import java.math.BigDecimal;
import java.util.List;

import de.tmosebach.slowen.backend.domain.Asset;
import de.tmosebach.slowen.backend.domain.Bankkonto;
import de.tmosebach.slowen.backend.domain.BilanzTyp;
import de.tmosebach.slowen.backend.domain.Buchung;
import de.tmosebach.slowen.backend.domain.BuchungArt;
import de.tmosebach.slowen.backend.domain.Depot;
import de.tmosebach.slowen.backend.domain.Konto;
import de.tmosebach.slowen.backend.domain.Kreditkarte;
import de.tmosebach.slowen.backend.domain.Umsatz;
import de.tmosebach.slowen.backend.domain.Versicherung;
import de.tmosebach.slowen.backend.restapapter.ApiAsset;
import de.tmosebach.slowen.backend.restapapter.ApiBilanzTyp;
import de.tmosebach.slowen.backend.restapapter.ApiBuchung;
import de.tmosebach.slowen.backend.restapapter.ApiBuchungArt;
import de.tmosebach.slowen.backend.restapapter.ApiKonto;
import de.tmosebach.slowen.backend.restapapter.ApiUmsatz;

public class ToDomainMapper {

	public static Konto apiKontoToKonto(ApiKonto apiKonto) {
		Konto result = null;
		if (isNull(apiKonto.getTyp())) {
			throw new IllegalArgumentException("Kontotyp fehlt.");
		}
		switch ((apiKonto.getTyp())) {
		case Konto:
			result = new Konto();
			if (isNull(apiKonto.getSaldo())) {
				result.setSaldo(BigDecimal.ZERO);
			} else {
				result.setSaldo(apiKonto.getSaldo());
			}
			break;
		case Bankkonto:
			Bankkonto bankkonto = new Bankkonto();
			bankkonto.setBic(apiKonto.getBic());
			bankkonto.setBank(apiKonto.getBank());
			bankkonto.setIban(apiKonto.getIban());
			result = bankkonto;
		
			break;
		case Depot:
			Depot depot = new Depot();
			depot.setNummer(apiKonto.getNummer());
			result = depot;
	
			break;
		case Kreditkarte:
			
			Kreditkarte kreditkarte = new Kreditkarte();
			kreditkarte.setNummer(apiKonto.getNummer());
			kreditkarte.setGueltigBis(apiKonto.getGueltigBis());
			result = kreditkarte;
		
			break;
		case Versicherung:
			
			Versicherung versicherung = new Versicherung();
			versicherung.setNummer(apiKonto.getNummer());
			result = versicherung;
			
			break;

		default:
			throw new IllegalArgumentException("Unbekannter Kontotyp: "+apiKonto.getTyp());
		}
		result.setId(stringToId(apiKonto.getId()));
		result.setName(apiKonto.getName());
		result.setBilanzTyp( apiBilanzTypToDomainBilanzTyp(apiKonto.getBilanzTyp()));
		if (isNull(apiKonto.getSaldo())) {
			result.setSaldo(BigDecimal.ZERO);
		} else {
			result.setSaldo(apiKonto.getSaldo());
		}
		return result;
	}

	private static BilanzTyp apiBilanzTypToDomainBilanzTyp(ApiBilanzTyp apiBilanzTyp) {
		if (nonNull(apiBilanzTyp)) {
			return BilanzTyp.valueOf(apiBilanzTyp.toString());
		}
		return null;
	}

	public static Asset apiAssetToAsset(ApiAsset apiAsset) {
		if (nonNull(apiAsset)) {
			Asset asset = new Asset();
			asset.setId(stringToId(apiAsset.getId()));
			asset.setName(apiAsset.getName());
			return asset;
		}
		return null;
	}

	private static Long stringToId(String id) {
		if (nonNull(id)) {
			return Long.valueOf(id);
		}
		return null;
	}

	public static Buchung apiBuchungToBuchung(ApiBuchung apiBuchung) {
		Buchung buchung = new Buchung();
		buchung.setArt(apiBuchungArtToBuchungArt(apiBuchung.getArt()));
		buchung.setEmpfaenger(apiBuchung.getEmpfaenger());
		buchung.setId(stringToId(apiBuchung.getId()));
		buchung.setVerwendung(apiBuchung.getVerwendung());
		
		buchung.setUmsaetze(apiUmsatzListToUmsatzListe(apiBuchung.getUmsaetze()));
		
		return buchung;
	}
	
	private static BuchungArt apiBuchungArtToBuchungArt(ApiBuchungArt apiArt) {
		if (nonNull(apiArt)) {
			return BuchungArt.valueOf(apiArt.toString());
		}
		return null;
	}

	private static List<Umsatz> apiUmsatzListToUmsatzListe(List<ApiUmsatz> apiUmsatzList) {
		return apiUmsatzList.stream()
				.map( umsatz -> apiUmsatzToUmsatz(umsatz) )
				.collect(toList());
	}

	private static Umsatz apiUmsatzToUmsatz(ApiUmsatz apiUmsatz) {
		Umsatz umsatz = new Umsatz();
		umsatz.setAsset(apiAssetToAsset(apiUmsatz.getAsset()));
		umsatz.setBetrag(apiUmsatz.getBetrag());
		umsatz.setId(stringToId(apiUmsatz.getId()));
		umsatz.setKonto(apiKontoToKonto(apiUmsatz.getKonto()));
		umsatz.setMenge(apiUmsatz.getMenge());
		umsatz.setValuta(apiUmsatz.getValuta());
		return umsatz;
	}
}
