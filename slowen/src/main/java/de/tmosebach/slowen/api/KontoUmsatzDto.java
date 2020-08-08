package de.tmosebach.slowen.api;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

@Data
public class KontoUmsatzDto {

	private LocalDate valuta;
	private BigDecimal betrag;
	private KontoDto konto;
}
