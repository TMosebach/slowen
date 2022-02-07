package de.tmosebach.slowen.backend.restapapter;

import java.util.Objects;

public class ApiAsset {

	public ApiAsset() {}
	
	public ApiAsset(String name) {
		this.name = name;
	}

	private String name;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Override
	public String toString() {
		return "ApiAsset [name=" + name + "]";
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
		ApiAsset other = (ApiAsset) obj;
		return Objects.equals(name, other.name);
	}
}
