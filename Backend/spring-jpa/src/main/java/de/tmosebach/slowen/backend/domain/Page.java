package de.tmosebach.slowen.backend.domain;

import java.util.List;

public class Page<T> {

	private List<T> content;
	private Integer totalPages;
	private Long totalElements;
	private Integer size;
	private Integer number;

	public Page(List<T> content, Integer totalPages, Long totalElements, Integer size, Integer number) {
		this.content = content;
		this.totalPages = totalPages;
		this.totalElements = totalElements;
		this.size = size;
		this.number = number;
	}
	public List<T> getContent() {
		return content;
	}
	public Integer getTotalPages() {
		return totalPages;
	}
	public Long getTotalElements() {
		return totalElements;
	}
	public Integer getSize() {
		return size;
	}
	public Integer getNumber() {
		return number;
	}
}
