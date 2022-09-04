package de.tmosebach.slowen.konten.api;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import de.tmosebach.slowen.konten.BilanzType;
import de.tmosebach.slowen.konten.KontoType;

public class CreateKontoRequest {

	@NotNull
	private KontoType type;
	
	@Size(min = 3, max = 50)
	@NotNull
	private String name;
	
	@NotNull
	private BilanzType bilanzType;
	
	@Override
	public String toString() {
		return "CreateKontoRequest [type=" + type + ", name=" + name + ", bilanzType=" + bilanzType + "]";
	}
	public KontoType getType() {
		return type;
	}
	public void setType(KontoType type) {
		this.type = type;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public BilanzType getBilanzType() {
		return bilanzType;
	}
	public void setBilanzType(BilanzType bilanzType) {
		this.bilanzType = bilanzType;
	}
}
