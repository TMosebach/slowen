package de.tmosebach.slowen.konten;

import static java.util.Objects.requireNonNull;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import de.tmosebach.slowen.shared.values.AssetIdentifier;
import de.tmosebach.slowen.shared.values.Betrag;
import de.tmosebach.slowen.shared.values.KontoIdentifier;
import de.tmosebach.slowen.shared.values.Waehrung;

public class Depot extends AbstractKonto {

	private List<Bestand> bestaende = new ArrayList<>();
	
	public Depot(KontoIdentifier id, String name, BilanzType bilanzType) {
		super(id, name, bilanzType);
	}

	public Depot(String id, String name, BilanzType bilanzType, BigDecimal saldo, Waehrung waehrung) {
		super(id, name, bilanzType, saldo, waehrung);
	}

	@Override
	public KontoType getType() {
		return KontoType.Depot;
	}
	
	public Bestand addBestand(Bestand bestand) {
		bestaende.add(bestand);
		return bestand;
	}
	
	@Override
	public Betrag getSaldo() {
		return bestaende.stream()
			.map( b -> b.getKaufWert())
			.reduce(Betrag.NULL_EUR, (a, b) -> a.add(b));
	}

	public List<Bestand> getBestaende() {
		return bestaende;
	}

	public Optional<Bestand> findBestand(AssetIdentifier asset) {
		return bestaende.stream()
				.filter( b -> asset.equals(b.getAssetId()))
				.findFirst();
	}

	public void setBestaende(List<Bestand> bestaende) {
		requireNonNull(bestaende);
		
		this.bestaende = bestaende;
	}
}
