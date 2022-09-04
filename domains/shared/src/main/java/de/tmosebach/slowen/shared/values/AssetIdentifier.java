package de.tmosebach.slowen.shared.values;

import java.util.Objects;

public class AssetIdentifier {
	private String isin;

	public AssetIdentifier(String isin) {
		this.isin = isin;
	}

	@Override
	public String toString() {
		return "AssetIdentifier [isin=" + isin + "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(isin);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		AssetIdentifier other = (AssetIdentifier) obj;
		return Objects.equals(isin, other.isin);
	}

	public String getIsin() {
		return isin;
	}
}
