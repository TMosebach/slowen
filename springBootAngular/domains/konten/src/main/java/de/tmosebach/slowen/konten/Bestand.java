package de.tmosebach.slowen.konten;

import java.math.BigDecimal;
import java.util.Objects;

import de.tmosebach.slowen.shared.values.AssetIdentifier;
import de.tmosebach.slowen.shared.values.Betrag;
import de.tmosebach.slowen.shared.values.KontoIdentifier;
import de.tmosebach.slowen.shared.values.Waehrung;

public class Bestand {

	private KontoIdentifier kontoId;
	private AssetIdentifier assetId;
	private BigDecimal menge;
	private Betrag kaufWert;
	
	public Bestand(String kontoId, String isin, BigDecimal menge, BigDecimal betrag, String waehrung) {
		this(new KontoIdentifier(kontoId), new AssetIdentifier(isin));
		this.menge = menge;
		this.kaufWert = new Betrag(betrag, Waehrung.valueOf(waehrung));
	}
	
	public Bestand(KontoIdentifier kontoId, AssetIdentifier assetId) {
		this.kontoId = kontoId;
		this.assetId = assetId;
		this.menge = BigDecimal.ZERO;
		this.kaufWert = Betrag.NULL_EUR;
	}
	
	public void addBestand(BigDecimal menge, Betrag wert) {
		this.menge = this.menge.add(menge);
		this.kaufWert = kaufWert.add(wert);
	}

	@Override
	public String toString() {
		return "Bestand [kontoId=" + kontoId + ", assetId=" + assetId + ", menge=" + menge + ", kaufWert=" + kaufWert
				+ "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(assetId, kontoId);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Bestand other = (Bestand) obj;
		return Objects.equals(assetId, other.assetId) && Objects.equals(kontoId, other.kontoId);
	}

	public KontoIdentifier getKontoId() {
		return kontoId;
	}

	public AssetIdentifier getAssetId() {
		return assetId;
	}

	public BigDecimal getMenge() {
		return menge;
	}

	public Betrag getKaufWert() {
		return kaufWert;
	}
}
