package de.tmosebach.slowen.exception;

public class UnkownEntityException extends Exception {

	private static final long serialVersionUID = 1L;

	public UnkownEntityException(String message, Object template) {
		super(message + template.toString());
	}
}
