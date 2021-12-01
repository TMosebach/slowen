package de.tmosebach.slowen.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class UnkownEntityException extends Exception {

	public UnkownEntityException(String message) {
		super(message);
	}

	private static final long serialVersionUID = 1L;

}
