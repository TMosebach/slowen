package de.tmosebach.slowen;

import static java.math.BigDecimal.ZERO;
import static java.util.Objects.nonNull;

import java.math.BigDecimal;
import java.util.UUID;

public class Utils {
	
	public static String createId() {
		return UUID.randomUUID().toString();
	}

	public static BigDecimal getBetragOder0(BigDecimal betrag) {
		if (nonNull(betrag)) {
			return betrag;
		}
		return ZERO;
	}
	
	public static boolean notZero(BigDecimal betrag) {
		return ZERO.compareTo(betrag) != 0;
	}
	
	private Utils() {}
}
