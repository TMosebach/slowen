package de.tmosebach.slowen.buchhaltung;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

import de.tmosebach.slowen.shared.values.AssetIdentifier;
import de.tmosebach.slowen.shared.values.Betrag;
import de.tmosebach.slowen.shared.values.KontoIdentifier;
import de.tmosebach.slowen.shared.values.Waehrung;

public class Umsatz {
	
	private BuchungIdentifier buchungIdentifier;
	private KontoIdentifier konto;
	private LocalDate valuta;
	private Betrag betrag;
	
	// Bestandsoperationen
	private AssetIdentifier asset;
	private BigDecimal menge;

	public Umsatz(BuchungIdentifier buchungIdentifier, KontoIdentifier konto, LocalDate valuta, Betrag betrag) {
		this.buchungIdentifier = buchungIdentifier;
		this.konto = konto;
		this.valuta = valuta;
		this.betrag = betrag;
	}

	public Umsatz(
			String buchungId,
			String kontoId,
			LocalDate valuta, 
			BigDecimal betrag,
			String waehrung,
			String assetId, 
			BigDecimal menge) {
		this(
			new BuchungIdentifier(buchungId),
			new KontoIdentifier(kontoId),
			valuta, 
			new Betrag(betrag, Waehrung.valueOf(waehrung)), 
			new AssetIdentifier(assetId), 
			menge);
	}
	
	public Umsatz(
			BuchungIdentifier buchungIdentifier,
			KontoIdentifier konto,
			LocalDate valuta, 
			Betrag betrag,
			AssetIdentifier asset, 
			BigDecimal menge) {
		this.buchungIdentifier = buchungIdentifier;
		this.konto = konto;
		this.valuta = valuta;
		this.betrag = betrag;
		this.asset = asset;
		this.menge = menge;
	}

	@Override
	public String toString() {
		return "Umsatz [buchungIdentifier=" + buchungIdentifier + ", konto=" + konto + ", valuta=" + valuta
				+ ", betrag=" + betrag + ", asset=" + asset + ", menge=" + menge + "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(buchungIdentifier, konto);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Umsatz other = (Umsatz) obj;
		return Objects.equals(buchungIdentifier, other.buchungIdentifier) && Objects.equals(konto, other.konto);
	}

	public BuchungIdentifier getBuchungIdentifier() {
		return buchungIdentifier;
	}

	public KontoIdentifier getKonto() {
		return konto;
	}

	public LocalDate getValuta() {
		return valuta;
	}

	public Betrag getBetrag() {
		return betrag;
	}

	public AssetIdentifier getAsset() {
		return asset;
	}

	public BigDecimal getMenge() {
		return menge;
	}
}
