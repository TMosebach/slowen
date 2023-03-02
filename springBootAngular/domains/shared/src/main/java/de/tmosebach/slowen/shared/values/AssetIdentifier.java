package de.tmosebach.slowen.shared.values;

import java.util.Objects;

public class AssetIdentifier {
	private String id;

	public AssetIdentifier(String id) {
		this.id = id;
	}

	@Override
	public String toString() {
		return "AssetIdentifier [id=" + id + "]";
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
		AssetIdentifier other = (AssetIdentifier) obj;
		return Objects.equals(id, other.id);
	}

	public String getId() {
		return id;
	}
}
