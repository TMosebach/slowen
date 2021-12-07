package de.tmosebach.slowen.backend.domain;

import java.math.BigDecimal;
import java.time.LocalDate;

public class HandelGenerator {

	private Asset asset;
	private Depot depot;
	private Konto verrechnungskonto;
	
	public HandelGenerator(Asset asset, Depot depot, Konto verrechnungskonto) {
		this.asset = asset;
		this.depot = depot;
		this.verrechnungskonto = verrechnungskonto;
	}
	
	public Buchung erzeugeHandel(BuchungArt art, BigDecimal menge, BigDecimal wert) {
		
		Umsatz depotUmsatz = new Umsatz();
		depotUmsatz.setAsset(asset);
		depotUmsatz.setKonto(depot);
		depotUmsatz.setValuta(LocalDate.now());
		depotUmsatz.setBetrag(wert);
		depotUmsatz.setMenge(menge);
		
		Umsatz verrechnungsUmsatz = new Umsatz();
		verrechnungsUmsatz.setKonto(verrechnungskonto);
		verrechnungsUmsatz.setValuta(LocalDate.now());
		verrechnungsUmsatz.setBetrag(wert.negate());
		
		Buchung buchung = new Buchung();
		buchung.setArt(art);
		buchung.setVerwendung(art + " " + asset.getName());
		buchung.addUmsatz(depotUmsatz);
		buchung.addUmsatz(verrechnungsUmsatz);
		
		return buchung;
	}
}
