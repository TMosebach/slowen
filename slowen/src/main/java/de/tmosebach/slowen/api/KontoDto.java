package de.tmosebach.slowen.api;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class KontoDto {

	private String id;
	private String type;
	private String name;
	private String art;
	private BigDecimal saldo;
}
