package de.tmosebach.slowen.backend.restapapter;

import static de.tmosebach.slowen.backend.Utils.string2LocalDate;
import static java.math.BigDecimal.valueOf;

import java.time.LocalDate;
import java.util.Objects;

import de.tmosebach.slowen.backend.values.Betrag;
import de.tmosebach.slowen.backend.values.Menge;

public class ApiUmsatz {
	
	public static class ApiUmsatzBuilder {

		private ApiUmsatz umsatz; 
		
		public ApiUmsatzBuilder() {
			umsatz = new ApiUmsatz();
		}
		
		public ApiUmsatzBuilder konto(String konto) {
			umsatz.setKonto(konto);
			return this;
		}

		public ApiUmsatzBuilder valuta(String datumString) {
			umsatz.setValuta(string2LocalDate(datumString));
			return this;
		}

		public ApiUmsatzBuilder betrag(double betragWert, String waehrung) {
			Betrag betrag = new Betrag(valueOf(betragWert), waehrung);
			umsatz.setBetrag(betrag);
			return this;
		}

		public ApiUmsatz build() {
			return umsatz;
		}

		public ApiUmsatzBuilder asset(String assetName) {
			ApiAsset asset = new ApiAsset(assetName);
			umsatz.setAsset(asset);
			return this;
		}

		public ApiUmsatzBuilder assetMenge(double mengeWert) {
			Menge menge = new Menge(valueOf(mengeWert));
			umsatz.setMenge(menge);
			return this;
		}
	}

	private String konto;
	private LocalDate valuta;
	private Betrag betrag;
	private ApiAsset asset;
	private Menge menge;
	
	public String getKonto() {
		return konto;
	}
	public void setKonto(String konto) {
		this.konto = konto;
	}
	public LocalDate getValuta() {
		return valuta;
	}
	public void setValuta(LocalDate valuta) {
		this.valuta = valuta;
	}
	public Betrag getBetrag() {
		return betrag;
	}
	public void setBetrag(Betrag betrag) {
		this.betrag = betrag;
	}
	public ApiAsset getAsset() {
		return asset;
	}
	public void setAsset(ApiAsset asset) {
		this.asset = asset;
	}
	public Menge getMenge() {
		return menge;
	}
	public void setMenge(Menge menge) {
		this.menge = menge;
	}
	@Override
	public String toString() {
		return "ApiUmsatz [konto=" + konto + ", valuta=" + valuta + ", betrag=" + betrag + ", asset=" + asset
				+ ", menge=" + menge + "]";
	}
	@Override
	public int hashCode() {
		return Objects.hash(asset, betrag, konto, menge, valuta);
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ApiUmsatz other = (ApiUmsatz) obj;
		return Objects.equals(asset, other.asset) && Objects.equals(betrag, other.betrag)
				&& Objects.equals(konto, other.konto) && Objects.equals(menge, other.menge)
				&& Objects.equals(valuta, other.valuta);
	}
}
