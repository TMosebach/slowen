package de.tmosebach.slowen.backend.restapapter.mapper;

import static java.util.Objects.*;
import de.tmosebach.slowen.backend.domain.Bankkonto;
import de.tmosebach.slowen.backend.domain.BilanzTyp;
import de.tmosebach.slowen.backend.domain.Depot;
import de.tmosebach.slowen.backend.domain.Konto;
import de.tmosebach.slowen.backend.domain.Kreditkarte;
import de.tmosebach.slowen.backend.domain.Versicherung;
import de.tmosebach.slowen.backend.restapapter.ApiBilanzTyp;
import de.tmosebach.slowen.backend.restapapter.ApiKonto;

public class ToDomainMapper {

	public static Konto apiKontoToKonto(ApiKonto apiKonto) {
		Konto result = null;
		if (isNull(apiKonto.getTyp())) {
			throw new IllegalArgumentException("Kontotyp fehlt.");
		}
		switch ((apiKonto.getTyp())) {
		case Konto:
			result = new Konto();
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
			// TODO
			result = depot;
	
			break;
		case Kreditkarte:
			
			Kreditkarte kreditkarte = new Kreditkarte();
			// TODO
			result = kreditkarte;
		
			break;
		case Versicherung:
			
			Versicherung versicherung = new Versicherung();
			// TODO
			result = versicherung;
			
			break;

		default:
			throw new IllegalArgumentException("Unbekannter Kontotyp: "+apiKonto.getTyp());
		}
		result.setName(apiKonto.getName());
		result.setBilanzTyp( apiBilanzTypToDomainBilanzTyp(apiKonto.getBilanzTyp()));
		result.setSaldo(apiKonto.getSaldo());
		return result;
	}

	private static BilanzTyp apiBilanzTypToDomainBilanzTyp(ApiBilanzTyp apiBilanzTyp) {
		return BilanzTyp.valueOf(apiBilanzTyp.toString());
	}

}
