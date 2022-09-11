package de.tmosebach.slowen.buchhaltung;

public class BuchungSelection {

	private int page = 1;
	private int size = 25;
	private String kontoId;

	public BuchungSelection(String kontoId) {
		this.kontoId = kontoId;
	}

	@Override
	public String toString() {
		return "BuchungSelection [page=" + page + ", size=" + size + ", kontoId=" + kontoId + "]";
	}

	public int getPage() {
		return page;
	}

	public BuchungSelection page(int page) {
		this.page = page;
		return this;
	}

	public int getSize() {
		return size;
	}

	public BuchungSelection size(int size) {
		this.size = size;
		return this;
	}

	public String getKontoId() {
		return kontoId;
	}
}
