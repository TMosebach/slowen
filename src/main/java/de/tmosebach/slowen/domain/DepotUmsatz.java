package de.tmosebach.slowen.domain;

import java.math.BigDecimal;

public class DepotUmsatz extends Umsatz {

	private String asset;
	private BigDecimal menge;

	@Override
	public String toString() {
		return "DepotUmsatz [depot=" + konto + ", art=" + art + ", valuta=" + valuta + ", betrag=" + betrag
				+ ", buchung=" + buchung + ", asset=" + asset + ", menge=" + menge + "]";
	}

	public String getAsset() {
		return asset;
	}

	public void setAsset(String asset) {
		this.asset = asset;
	}

	public BigDecimal getMenge() {
		return menge;
	}

	public void setMenge(BigDecimal menge) {
		this.menge = menge;
	}
}
