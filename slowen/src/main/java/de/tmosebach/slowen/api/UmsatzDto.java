package de.tmosebach.slowen.api;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

@Data
public class UmsatzDto {

	private LocalDate valuta;
	private BigDecimal betrag;
	private KontoDto konto;
}
