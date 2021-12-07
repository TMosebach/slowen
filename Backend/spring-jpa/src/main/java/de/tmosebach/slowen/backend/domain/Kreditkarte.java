package de.tmosebach.slowen.backend.domain;

public class Kreditkarte {

	private String nummer;
	private String gueltigBis;
	public String getNummer() {
		return nummer;
	}
	public void setNummer(String nummer) {
		this.nummer = nummer;
	}
	public String getGueltigBis() {
		return gueltigBis;
	}
	public void setGueltigBis(String gueltigBis) {
		this.gueltigBis = gueltigBis;
	}
}
