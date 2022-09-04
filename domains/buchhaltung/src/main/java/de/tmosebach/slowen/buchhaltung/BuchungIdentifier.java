package de.tmosebach.slowen.buchhaltung;

import java.util.Objects;

public class BuchungIdentifier {

	private String id;

	public BuchungIdentifier(String id) {
		this.id = id;
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
		BuchungIdentifier other = (BuchungIdentifier) obj;
		return Objects.equals(id, other.id);
	}

	@Override
	public String toString() {
		return "BuchungIdentifier [id=" + id + "]";
	}
	
	public String getId() {
		return id;
	}
}
