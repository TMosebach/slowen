package de.tmosebach.slowen.backend.restapapter;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import de.tmosebach.slowen.backend.values.Betrag;

@JsonInclude(Include.NON_NULL)
public class ApiKonto extends ApiKontoRef {

	private Betrag saldo;
	private List<ApiBestand> bestaende;

	public List<ApiBestand> getBestaende() {
		return bestaende;
	}

	public void setBestaende(List<ApiBestand> bestaende) {
		this.bestaende = bestaende;
	}

	public Betrag getSaldo() {
		return saldo;
	}

	public void setSaldo(Betrag saldo) {
		this.saldo = saldo;
	}

	@Override
	public String toString() {
		return "ApiKonto [saldo=" + saldo + ", bestaende=" + bestaende + ", toString()=" + super.toString() + "]";
	}
	
}
