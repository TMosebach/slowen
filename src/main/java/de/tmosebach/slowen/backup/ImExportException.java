package de.tmosebach.slowen.backup;

import java.io.IOException;

public class ImExportException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public ImExportException(IOException e) {
		super(e.getMessage(), e);
	}

}
