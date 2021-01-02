package de.tmosebach.slowen.api;

import java.math.BigDecimal;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data @EqualsAndHashCode(callSuper = true)
public class DepotDto extends KontoDto {

	public DepotDto(String id, String type, String name, String art, BigDecimal saldo, KontoDto verrechnungskonto) {
		super(id, type, name, art, saldo);
		this.verrechnungskonto = verrechnungskonto;
	}

	private KontoDto verrechnungskonto;
}
