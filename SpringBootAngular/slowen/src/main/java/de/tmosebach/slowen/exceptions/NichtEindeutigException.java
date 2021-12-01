package de.tmosebach.slowen.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.PRECONDITION_FAILED)
public class NichtEindeutigException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public NichtEindeutigException(String message) {
		super(message);
	}
}
