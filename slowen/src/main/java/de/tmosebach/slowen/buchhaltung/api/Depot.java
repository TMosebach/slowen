package de.tmosebach.slowen.buchhaltung.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class Depot extends Konto {

	private String type = "Depot";

	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
}
