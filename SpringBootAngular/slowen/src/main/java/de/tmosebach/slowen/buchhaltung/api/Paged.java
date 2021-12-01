package de.tmosebach.slowen.buchhaltung.api;

import java.util.List;

public class Paged<T> {
	
	private List<T> content;
	private int size;
	private int page;
	private int count;
	
	public Paged(List<T> content, int size, int page, int count) {
		this.content = content;
		this.size = size;
		this.page = page;
		this.count = count;
	}
	public List<T> getContent() {
		return content;
	}
	public int getSize() {
		return size;
	}
	public int getPage() {
		return page;
	}
	public int getCount() {
		return count;
	}
}
