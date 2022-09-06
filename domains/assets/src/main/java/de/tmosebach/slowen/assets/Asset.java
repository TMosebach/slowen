package de.tmosebach.slowen.assets;

import java.util.Objects;

import de.tmosebach.slowen.shared.values.AssetIdentifier;

public class Asset {

	private AssetIdentifier id;
	private String name;
	private String isin;
	private String wpk;
	
	public Asset(AssetIdentifier id, String name) {
		this.id = id;
		this.name = name;
	}

	public Asset(String id, String name, String isin, String wpk) {
		this(new AssetIdentifier(id), name);
		this.isin = isin;
		this.wpk = wpk;
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

	public AssetIdentifier getId() {
		return id;
	}

	@Override
	public String toString() {
		return "Asset [id=" + id + ", name=" + name + ", isin=" + isin + ", wpk=" + wpk + "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(id);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Asset other = (Asset) obj;
		return Objects.equals(id, other.id);
	}
}
