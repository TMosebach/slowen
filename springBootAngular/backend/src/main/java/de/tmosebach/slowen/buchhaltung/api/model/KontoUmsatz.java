package de.tmosebach.slowen.buchhaltung.api.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import de.tmosebach.slowen.shared.values.AssetIdentifier;
import de.tmosebach.slowen.shared.values.Betrag;
import de.tmosebach.slowen.shared.values.KontoIdentifier;

@JsonInclude(Include.NON_NULL)
public class KontoUmsatz {

	private KontoIdentifier konto;
	private LocalDate valuta;
	private Betrag betrag;
	
	private AssetIdentifier asset;
	private BigDecimal menge;
	
	@Override
	public String toString() {
		return "KontoUmsatz [konto=" + konto + ", valuta=" + valuta + ", betrag=" + betrag + ", asset=" + asset
				+ ", menge=" + menge + "]";
	}
	public KontoIdentifier getKonto() {
		return konto;
	}
	public void setKonto(KontoIdentifier konto) {
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
	public AssetIdentifier getAsset() {
		return asset;
	}
	public void setAsset(AssetIdentifier asset) {
		this.asset = asset;
	}
	public BigDecimal getMenge() {
		return menge;
	}
	public void setMenge(BigDecimal menge) {
		this.menge = menge;
	}
}
