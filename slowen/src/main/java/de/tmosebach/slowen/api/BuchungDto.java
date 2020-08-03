package de.tmosebach.slowen.api;

import java.util.List;

import lombok.Data;

@Data
public class BuchungDto {

	private String id;
	private String empfaenger;
	private String verwendung;
	private List<UmsatzDto> umsaetze;
}
