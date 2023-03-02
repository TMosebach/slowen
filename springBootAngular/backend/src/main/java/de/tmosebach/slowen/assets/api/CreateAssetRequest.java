package de.tmosebach.slowen.assets.api;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class CreateAssetRequest {

	@Size(min = 1, max = 50)
	@NotBlank
	private String name;
	
	@Size(min = 12, max = 12)
	@NotBlank
	private String isin;
	
	@Size(min = 6, max = 6)
	@NotBlank
	private String wpk;

	@Override
	public String toString() {
		return "CreateAssetRequest [name=" + name + ", isin=" + isin + ", wpk=" + wpk + "]";
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getIsin() {
		return isin;
	}

	public void setIsin(String isin) {
		this.isin = isin;
	}

	public String getWpk() {
		return wpk;
	}

	public void setWpk(String wpk) {
		this.wpk = wpk;
	}
}
