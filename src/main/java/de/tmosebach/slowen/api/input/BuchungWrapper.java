package de.tmosebach.slowen.api.input;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import de.tmosebach.slowen.values.Vorgang;

@JsonInclude(Include.NON_NULL)
public class BuchungWrapper {

	private Vorgang vorgang;
	private Buchung buchung;
	private Kauf kauf;
	private Einlieferung einlieferung;
	private Ertrag ertrag;
	private Verkauf verkauf;
	private Tilgung tilgung;
	public Vorgang getVorgang() {
		return vorgang;
	}
	public void setVorgang(Vorgang vorgang) {
		this.vorgang = vorgang;
	}
	public Buchung getBuchung() {
		return buchung;
	}
	public void setBuchung(Buchung buchung) {
		this.buchung = buchung;
	}
	public Kauf getKauf() {
		return kauf;
	}
	public void setKauf(Kauf kauf) {
		this.kauf = kauf;
	}
	public Einlieferung getEinlieferung() {
		return einlieferung;
	}
	public void setEinlieferung(Einlieferung einlieferung) {
		this.einlieferung = einlieferung;
	}
	public Ertrag getErtrag() {
		return ertrag;
	}
	public void setErtrag(Ertrag ertrag) {
		this.ertrag = ertrag;
	}
	public Verkauf getVerkauf() {
		return verkauf;
	}
	public void setVerkauf(Verkauf verkauf) {
		this.verkauf = verkauf;
	}
	public Tilgung getTilgung() {
		return tilgung;
	}
	public void setTilgung(Tilgung tilgung) {
		this.tilgung = tilgung;
	}
}
