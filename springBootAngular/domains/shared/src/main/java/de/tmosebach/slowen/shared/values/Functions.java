package de.tmosebach.slowen.shared.values;

import java.util.UUID;

public class Functions {

	public static String createId() {
		return UUID.randomUUID().toString();
	}
}
