package de.tmosebach.slowen.shared.values;

import java.util.List;

public class Page<T> {
	
	public static class Builder<T> {
		
		private Page<T> page;

		public Builder() {
			page = new Page<>();
		}

		public Builder<T> content(List<T> content) {
			page.setContent(content);
			return this;
		}

		public Builder<T> elementCount(int elementCount) {
			page.setElementCount(elementCount);
			return this;
		}

		public Builder<T> page(int page) {
			this.page.setPage(page);
			return this;
		}

		public Builder<T> size(int size) {
			page.setSize(size);
			return this;
		}

		public Page<T> get() {
			return page;
		}
		
	}

	private List<T> content;
	private int elementCount;
	private int page;
	private int size;
	
	private Page() {}
	
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

	protected void setContent(List<T> content) {
		this.content = content;
	}

	protected void setElementCount(int elementCount) {
		this.elementCount = elementCount;
	}

	protected void setPage(int page) {
		this.page = page;
	}

	protected void setSize(int size) {
		this.size = size;
	}
}
