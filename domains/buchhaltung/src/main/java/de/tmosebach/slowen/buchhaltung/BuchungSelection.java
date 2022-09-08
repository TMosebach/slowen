package de.tmosebach.slowen.buchhaltung;

public class BuchungSelection {

	private Integer page = 1;
	private Integer size;
	
	@Override
	public String toString() {
		return "BuchungSelection [page=" + page + ", size=" + size + "]";
	}

	protected Integer getPage() {
		return page;
	}

	protected void setPage(Integer page) {
		this.page = page;
	}

	protected Integer getSize() {
		return size;
	}

	protected void setSize(Integer size) {
		this.size = size;
	}
}
