package de.tmosebach.slowen.backend.domain;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

public class Kreditkarte extends Konto {

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
	@Override
	public int hashCode() {
		return HashCodeBuilder.reflectionHashCode(this);
	}
	@Override
	public boolean equals(Object obj) {
		return EqualsBuilder.reflectionEquals(this, obj, "umsaetze");
	}
}
