package de.tmosebach.slowen.backend.domain;

import java.util.List;

public class Page<T> {

	private List<T> content;
	private long totalElements;
	private long pageCount;
	public long getPageCount() {
		return pageCount;
	}
	private int size;
	private int page;

	public Page(
			List<T> content, 
			long totalElements, long pageCount,
			int page, int size) {
		this.content = content;
		this.totalElements = totalElements;
		this.pageCount = pageCount;
		this.size = size;
		this.page = page;
	}
	public List<T> getContent() {
		return content;
	}
	public long getTotalElements() {
		return totalElements;
	}
	public int getSize() {
		return size;
	}
	public int getPage() {
		return page;
	}
	@Override
	public String toString() {
		return "Page [totalElements=" + totalElements + ", pageCount=" + pageCount + ", size=" + size + ", page=" + page
				+ ", content=" + content + "]";
	}
}
