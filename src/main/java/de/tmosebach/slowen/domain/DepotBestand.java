package de.tmosebach.slowen.domain;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class DepotBestand {

	private String name;
	private List<Bestand> bestaende = new ArrayList<>();
	
	public DepotBestand(String depotName) {
		name = depotName;
	}
	@Override
	public String toString() {
		return "DepotBestand [name=" + name + ", bestaende=" + bestaende + "]";
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public List<Bestand> getBestaende() {
		return bestaende;
	}
	public void setBestaende(List<Bestand> bestaende) {
		this.bestaende = bestaende;
	}
	public Optional<Bestand> getBestandZu(String asset) {
		return bestaende.stream()
				.filter( bestand -> bestand.getAsset().equals(asset))
				.findFirst();
	}
	public void add(Bestand newBestand) {
		bestaende.add(newBestand);
	}
}
