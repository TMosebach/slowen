package de.tmosebach.slowen.api;

import java.util.List;

import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import de.tmosebach.slowen.api.types.Konto;
import de.tmosebach.slowen.domain.KontoService;

@Controller
public class QueryController {
	
	private KontoService kontoService;

	public QueryController(KontoService kontoService) {
		this.kontoService = kontoService;
	}

	@QueryMapping
	public List<String> buchungen(String konto) {
		return List.of();
	}

	@QueryMapping
	public Konto findKontoByName(String kontoName) {
		de.tmosebach.slowen.domain.Konto konto = kontoService.findByName(kontoName).orElseThrow();
		
		Konto result = new Konto();
		result.setName(konto.getName());
		result.setArt(konto.getArt());
		result.setBilanzPosition(konto.getBilanzPosition());
		result.setWaehrung(konto.getWaehrung());
		
		return result;
	}
}
