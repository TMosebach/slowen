package de.tmosebach.slowen.backend.restapapter;

import static java.util.Objects.nonNull;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import de.tmosebach.slowen.backend.domain.Asset;
import de.tmosebach.slowen.backend.domain.Bestand;
import de.tmosebach.slowen.backend.domain.Buchung;
import de.tmosebach.slowen.backend.domain.Konto;
import de.tmosebach.slowen.backend.domain.Umsatz;

public class Domain2ApiMapper {
	
	public static List<ApiBuchung> buchungList2ApiBuchungList(List<Buchung> buchungList) {
		return buchungList.stream().map( buchung -> buchung2ApiBuchung(buchung)).collect(Collectors.toList());
	}

	public static ApiBuchung buchung2ApiBuchung(Buchung buchung) {
		ApiBuchung apiBuchung = new ApiBuchung();
		apiBuchung.setArt(buchung.getArt());
		apiBuchung.setDatum(buchung.getDatum());
		apiBuchung.setEmpfaenger(buchung.getEmpfaenger());
		apiBuchung.setBeschreibung(buchung.getBeschreibung());
		apiBuchung.setUmsaetze(umsatzList2ApiUmsatzList(buchung.getUmsaetze()));

		return apiBuchung;
	}

	private static List<ApiUmsatz> umsatzList2ApiUmsatzList(List<Umsatz> umsaetze) {
		return umsaetze.stream().map( umsatz -> umsatz2ApiUmsatz(umsatz)).collect(Collectors.toList());
	}

	private static ApiUmsatz umsatz2ApiUmsatz(Umsatz umsatz) {
		ApiUmsatz apiUmsatz = new ApiUmsatz();
		if (nonNull(umsatz.getKonto())) {
			apiUmsatz.setKonto(konto2ApiKonto(umsatz.getKonto()));
		}
		apiUmsatz.setValuta(umsatz.getValuta());
		if (nonNull(umsatz.getBetrag())) {
			apiUmsatz.setBetrag(umsatz.getBetrag());
		}
		if (nonNull(umsatz.getAsset())) {
			apiUmsatz.setAsset(umsatz.getAsset());
		}
		if (nonNull(umsatz.getMenge())) {
			apiUmsatz.setMenge(umsatz.getMenge());
		}
		return apiUmsatz;
	}

	private static ApiAsset asset2ApiAsset(Asset asset) {
		ApiAsset apiAsset = new ApiAsset();
		apiAsset.setName(asset.getName());
		return apiAsset;
	}

	public static ApiKonto konto2ApiKonto(Konto konto) {
		ApiKonto apiKonto = new ApiKonto();
		apiKonto.setId( Long.toString(konto.getId()) );
		apiKonto.setName(konto.getName());
		apiKonto.setSaldo(konto.getSaldo());
		if (konto.hasBestaende()) {
			apiKonto.setBestaende(
				konto.getBestaende().stream()
				.map(bestand -> bestand2ApiBestand(bestand))
				.collect(Collectors.toList())
			);
		}
		return apiKonto;
	}

	private static ApiBestand bestand2ApiBestand(Bestand bestand) {
		ApiBestand apiBestand = new ApiBestand();
		apiBestand.setAsset(bestand.getAsset());
		apiBestand.setEinstandsWert(bestand.getEinstandsWert());
		apiBestand.setMenge(bestand.getMenge());
		return apiBestand;
	}

	public static List<ApiKonto> kontoList2ApiKontoList(List<Konto> kontoList) {
		return kontoList.stream().map( k -> konto2ApiKonto(k)).collect(Collectors.toList());
	}

	public static List<ApiAsset> assetList2ApiAssetList(Set<Asset> assetList) {
		return assetList.stream().map( a -> asset2ApiAsset(a)).collect(Collectors.toList());
	}
}
