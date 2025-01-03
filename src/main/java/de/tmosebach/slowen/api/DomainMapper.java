package de.tmosebach.slowen.api;

import static de.tmosebach.slowen.Utils.getBetragOder0;
import static de.tmosebach.slowen.Utils.notZero;
import static de.tmosebach.slowen.domain.Kontonamen.DIVIDENDE;
import static de.tmosebach.slowen.domain.Kontonamen.KEST;
import static de.tmosebach.slowen.domain.Kontonamen.KURSGEWINN;
import static de.tmosebach.slowen.domain.Kontonamen.KURSVERLUST;
import static de.tmosebach.slowen.domain.Kontonamen.PROVISION;
import static de.tmosebach.slowen.domain.Kontonamen.SOLI;
import static de.tmosebach.slowen.domain.Kontonamen.STUECKZINS;
import static de.tmosebach.slowen.domain.Kontonamen.ZINSKUPON;
import static java.math.BigDecimal.ZERO;
import static java.util.Objects.nonNull;

import java.math.BigDecimal;

import de.tmosebach.slowen.api.input.Einlieferung;
import de.tmosebach.slowen.api.input.Ertrag;
import de.tmosebach.slowen.api.input.Ertragsart;
import de.tmosebach.slowen.api.input.Kauf;
import de.tmosebach.slowen.api.input.Tilgung;
import de.tmosebach.slowen.api.input.Verkauf;
import de.tmosebach.slowen.domain.Bestand;
import de.tmosebach.slowen.domain.Buchung;
import de.tmosebach.slowen.domain.DepotBestand;

public class DomainMapper {

	public static Buchung toBuchung(de.tmosebach.slowen.api.input.Buchung input) {
		BuchungBuilder builder = 
				BuchungBuilder
				.newBuchung(
					input.getId(),
					input.getDatum(),
					input.getEmpfaenger(),
					input.getVerwendung());

		input.getUmsaetze().forEach( umsatz -> 
				builder.addKontoUmsatz(
					umsatz.getKonto(),
					umsatz.getValuta(),
					umsatz.getBetrag())
			);
		
		return builder.getBuchung();
	}
	
	public static Buchung toBuchung(Einlieferung einlieferung) {
		BuchungBuilder builder = 
				BuchungBuilder.newEinlieferung(
					einlieferung.getDatum(),
					einlieferung.getAsset()
						+" "+einlieferung.getMenge()
						+ (nonNull(einlieferung.getBetrag())
								?" zu "+einlieferung.getBetrag()
								:""));
			
		builder.addDepotUmsatz(
				einlieferung.getDepot(),
				einlieferung.getAsset(),
				einlieferung.getBetrag(),
				einlieferung.getValuta(),
				einlieferung.getMenge());
		
		return builder.getBuchung();
	}
	
	public static Buchung toBuchung(Kauf kauf) {
    	BuchungBuilder builder = 
			BuchungBuilder
			.newKauf(
				kauf.getDatum(),
				kauf.getAsset()+" "+kauf.getMenge()
				+ " zu "+ kauf.getBetrag());
		
		BigDecimal einstandswert = kauf.getBetrag();
		BigDecimal stueckzins = getBetragOder0(kauf.getStueckzins());
		BigDecimal provision = getBetragOder0(kauf.getProvision());
		
		BigDecimal belastung = 
				einstandswert.add(provision).add(stueckzins).negate();
		
		builder.addDepotUmsatz(
			kauf.getDepot(),
			kauf.getAsset(),
			einstandswert,
			kauf.getValuta(),
			kauf.getMenge());
		
		builder.addKontoUmsatz(kauf.getKonto(), kauf.getValuta(), belastung);
		
		if (notZero(provision)) {
			builder.addKontoUmsatz(PROVISION, kauf.getValuta(), provision);
		}
		
		if (notZero(stueckzins)) {
			builder.addKontoUmsatz(STUECKZINS, kauf.getValuta(), stueckzins);
		}
		
		return builder.getBuchung();
	}
	
	public static Buchung toBuchung(Ertrag ertrag) {
		BuchungBuilder builder = 
				BuchungBuilder
				.newErtrag(
					ertrag.getDatum(),
					"Ertrag zu "+ertrag.getAsset());
			
		BigDecimal bruttowert = ertrag.getBetrag();
		BigDecimal kest = getBetragOder0(ertrag.getKest());
		BigDecimal soli = getBetragOder0(ertrag.getSoli());
		
		BigDecimal gutschrift = 
				bruttowert
				.subtract(soli)
				.subtract(kest);
		
		builder.addDepotUmsatz(
				ertrag.getDepot(),
				ertrag.getAsset(),
				ZERO,
				ertrag.getValuta(),
				ZERO);

		if (ertrag.getErtragsart() == Ertragsart.Dividende) {
			builder.addKontoUmsatz(DIVIDENDE, ertrag.getValuta(), bruttowert.negate());
		} else {
			builder.addKontoUmsatz(ZINSKUPON, ertrag.getValuta(), bruttowert.negate());
		}
		builder.addKontoUmsatz(ertrag.getKonto(), ertrag.getValuta(), gutschrift);

		if (notZero(kest)) {
			builder.addKontoUmsatz(KEST, ertrag.getValuta(), kest);
		}
		
		if (notZero(soli)) {
			builder.addKontoUmsatz(SOLI, ertrag.getValuta(), soli);
		}
		
		return builder.getBuchung();
	}
	
	public static Buchung toBuchung(
			Verkauf verkauf,
			DepotBestand depotBestand) {
    	BuchungBuilder builder = 
    			BuchungBuilder
    			.newVerkauf(
    				verkauf.getDatum(),
					verkauf.getAsset()+" "+verkauf.getMenge()
					+ " zu "+ verkauf.getBetrag());
		
		BigDecimal kurswert = verkauf.getBetrag();
		BigDecimal provision = getBetragOder0(verkauf.getProvision());
		BigDecimal kest = getBetragOder0(verkauf.getKest());
		BigDecimal soli = getBetragOder0(verkauf.getSoli());
		
		BigDecimal gutschrift = 
			kurswert
				.subtract(provision)
				.subtract(soli)
				.subtract(kest);
		
		Bestand bestand = depotBestand.getBestandZu(verkauf.getAsset()).orElseThrow();
		BigDecimal ausgangsbestand = bestand.getMenge();
		BigDecimal bestandsaenderung = verkauf.getMenge().negate();
		
		BigDecimal verkaufQuote = bestandsaenderung.divide(ausgangsbestand);
		BigDecimal wertabgang = bestand.getEinstand().multiply( verkaufQuote );
		BigDecimal guv = 
				gutschrift.add(wertabgang)
				.negate(); // Buchungswert ermitteln
		
		// Falls es GuV gab
		if (guv.compareTo(BigDecimal.ZERO) > 0) {
			builder.addKontoUmsatz(KURSVERLUST, verkauf.getValuta(), guv);
		} else if (guv.compareTo(BigDecimal.ZERO) < 0){
			builder.addKontoUmsatz(KURSGEWINN, verkauf.getValuta(), guv);
		}
		
		builder.addDepotUmsatz(
				verkauf.getDepot(),
				verkauf.getAsset(),
				wertabgang,
				verkauf.getValuta(),
				bestandsaenderung);

		builder.addKontoUmsatz(verkauf.getKonto(), verkauf.getValuta(), gutschrift);
		
		if (notZero(provision)) {
			builder.addKontoUmsatz(PROVISION, verkauf.getValuta(), provision);
		}
		
		if (notZero(kest)) {
			builder.addKontoUmsatz(KEST, verkauf.getValuta(), kest);
		}
		
		if (notZero(soli)) {
			builder.addKontoUmsatz(SOLI, verkauf.getValuta(), soli);
		}
		
		return builder.getBuchung();
	}
	
	public static Buchung toBuchung(
			Tilgung tilgung,
			DepotBestand depotBestand) {
		BuchungBuilder builder = 
				BuchungBuilder
				.newTilgung(
					tilgung.getDatum(),
					tilgung.getAsset()+" "+tilgung.getMenge());
			
		BigDecimal kurswert = tilgung.getBetrag();
		BigDecimal kest = getBetragOder0(tilgung.getKest());
		BigDecimal soli = getBetragOder0(tilgung.getSoli());
		
		BigDecimal gutschrift = 
			kurswert
				.subtract(soli)
				.subtract(kest);
		
		Bestand bestand = depotBestand.getBestandZu(tilgung.getAsset()).orElseThrow();
		BigDecimal ausgangsbestand = bestand.getMenge();
		BigDecimal bestandsaenderung = tilgung.getMenge().negate();
		
		BigDecimal verkaufQuote = bestandsaenderung.divide(ausgangsbestand);
		BigDecimal wertabgang = bestand.getEinstand().multiply( verkaufQuote );
		BigDecimal guv = 
				gutschrift.add(wertabgang)
				.negate(); // Buchungswert ermitteln
		
		// Falls es GuV gab
		if (guv.compareTo(BigDecimal.ZERO) > 0) {
			builder.addKontoUmsatz(KURSVERLUST, tilgung.getValuta(), guv);
		} else if (guv.compareTo(BigDecimal.ZERO) < 0){
			builder.addKontoUmsatz(KURSGEWINN, tilgung.getValuta(), guv);
		}
		
		builder.addDepotUmsatz(
				tilgung.getDepot(),
				tilgung.getAsset(),
				wertabgang,
				tilgung.getValuta(),
				bestandsaenderung);

		builder.addKontoUmsatz(tilgung.getKonto(), tilgung.getValuta(), gutschrift);

		if (notZero(kest)) {
			builder.addKontoUmsatz(KEST, tilgung.getValuta(), kest);
		}
		
		if (notZero(soli)) {
			builder.addKontoUmsatz(SOLI, tilgung.getValuta(), soli);
		}
		
		return builder.getBuchung();
	}
}
