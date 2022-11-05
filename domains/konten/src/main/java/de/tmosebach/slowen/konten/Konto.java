package de.tmosebach.slowen.konten;

import static de.tmosebach.slowen.shared.values.Betrag.NULL_EUR;
import static java.util.Objects.requireNonNull;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import de.tmosebach.slowen.shared.values.AssetIdentifier;
import de.tmosebach.slowen.shared.values.Betrag;
import de.tmosebach.slowen.shared.values.KontoIdentifier;
import de.tmosebach.slowen.shared.values.Waehrung;

public class Konto {
	
	public static Konto newKonto(KontoIdentifier id, String name, BilanzType bilanzType) {
		return new Konto(id, KontoType.Konto, name, bilanzType);
	}
	
	public static Konto newDepot(KontoIdentifier id, String name) {
		return new Konto(id, KontoType.Depot, name, BilanzType.Bestand);
	}

	private KontoIdentifier id;
	private KontoType kontoType;
	private String name;
	private BilanzType bilanzType;
	private Betrag saldo;
	private List<Bestand> bestaende = new ArrayList<>();
	
	private Konto(KontoIdentifier id, KontoType kontoType, String name, BilanzType bilanzType) {
		this.id = id;
		this.kontoType = kontoType;
		this.name = name;
		this.bilanzType = bilanzType;
		this.saldo = NULL_EUR;
	}
	
	/**
	 * Konstruktur für die Persistenz-Schicht
	 * 
	 * @param id
	 * @param name
	 * @param kontoType
	 * @param bilanzType
	 * @param saldo
	 * @param waehrung
	 */
	public Konto(String id, String name, KontoType kontoType, BilanzType bilanzType, BigDecimal saldo, Waehrung waehrung) {
		this.id = new KontoIdentifier(id);
		this.name = name;
		this.kontoType = kontoType;
		this.bilanzType = bilanzType;
		this.saldo = new Betrag(saldo, waehrung);
	}
	
	@Override
	public int hashCode() {
		return Objects.hash(id);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Konto other = (Konto) obj;
		return Objects.equals(id, other.id);
	}
	
	public Bestand addBestand(Bestand bestand) {
		bestaende.add(bestand);
		return bestand;
	}
	
	public Betrag getSaldo() {
		return kontoType == KontoType.Konto?
				getKontoSaldo():
					getDepotSaldo();
	}
	
	private Betrag getDepotSaldo() {
		return bestaende.stream()
			.map( b -> b.getKaufWert())
			.reduce(Betrag.NULL_EUR, (a, b) -> a.add(b));
	}

	private Betrag getKontoSaldo() {
		return saldo;
	}
	
	public void addToSaldo(Betrag betrag) {
		this.saldo = this.saldo.add(betrag);
	}

	public KontoIdentifier getId() {
		return id;
	}
	
	public KontoType getKontoType() {
		return kontoType;
	}
	
	public String getName() {
		return name;
	}

	public BilanzType getBilanzType() {
		return bilanzType;
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
