package de.tmosebach.slowen.backend.restapapter;

import java.util.Objects;

import de.tmosebach.slowen.backend.values.Betrag;

public class ApiKonto {

	private String name;
	private Betrag saldo;

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
