package de.tmosebach.slowen.shared.values;

import java.util.List;

public class Page<T> {
	
	private List<T> content;
	private int elementCount;
	private int page;
	private int size;
	
	public Page() {}
	
	@Override
	public String toString() {
		return "Page [content=" + content + ", elementCount=" + elementCount + ", page=" + page + ", size=" + size
				+ "]";
	}

	public int getPageCount() {
		int pageCount = elementCount / size;
		if (elementCount % size > 0) {
			pageCount++;
		}
		return pageCount;
	}

	public List<T> getContent() {
		return content;
	}

	public int getElementCount() {
		return elementCount;
	}

	public int getPage() {
		return page;
	}

	public int getSize() {
		return size;
	}

	public Page<T> content(List<T> content) {
		this.content = content;
		return this;
	}

	public Page<T> elementCount(int elementCount) {
		this.elementCount = elementCount;
		return this;
	}

	public Page<T> page(int page) {
		this.page = page;
		return this;
	}

	public Page<T> size(int size) {
		this.size = size;
		return this;
	}
}
