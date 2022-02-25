package de.tmosebach.slowen.backend.restapapter;

import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import de.tmosebach.slowen.backend.values.Betrag;

@JsonInclude(Include.NON_NULL)
public class ApiKonto {

	private String name;
	private Betrag saldo;
	private List<ApiBestand> bestaende;

	public List<ApiBestand> getBestaende() {
		return bestaende;
	}

	public void setBestaende(List<ApiBestand> bestaende) {
		this.bestaende = bestaende;
	}

	public ApiKonto() {}
	
	public ApiKonto(String name) {
		this.name = name;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Betrag getSaldo() {
		return saldo;
	}

	public void setSaldo(Betrag saldo) {
		this.saldo = saldo;
	}

	@Override
	public String toString() {
		return "ApiKonto [name=" + name + "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(name);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ApiKonto other = (ApiKonto) obj;
		return Objects.equals(name, other.name);
	}
}
