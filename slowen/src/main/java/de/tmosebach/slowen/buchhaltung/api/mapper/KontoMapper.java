package de.tmosebach.slowen.buchhaltung.api.mapper;

import static java.util.Objects.nonNull;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import de.tmosebach.slowen.buchhaltung.api.Bestand;
import de.tmosebach.slowen.buchhaltung.api.Konto;
import de.tmosebach.slowen.buchhaltung.model.Depot;

@Component
public class KontoMapper {
	
	@Autowired
	private AssetMapper assetMapper;

	public List<Konto> domainKontoListToApiKontoList(List<de.tmosebach.slowen.buchhaltung.model.Konto> domainKonten) {
		return domainKonten.stream()
				.map( domainKonto -> domainKontoToApiKonto(domainKonto) )
				.collect(Collectors.toList());
	}

	public Konto domainKontoToApiKonto(de.tmosebach.slowen.buchhaltung.model.Konto domainKonto) {
		Konto apiKonto = new Konto();
		apiKonto.setId(Long.toString(domainKonto.getId()));
		apiKonto.setName(domainKonto.getName());
		apiKonto.setArt(domainKonto.getArt());
		if (domainKonto instanceof Depot) {
			Depot depot = (Depot)domainKonto;
			apiKonto.setType("Depot");
			apiKonto.setBestaende(domainBestandListToApiBestandList(depot.getBestaende()));
		} else {
			apiKonto.setType("Konto");
		}
		
		apiKonto.setSaldo(domainKonto.getSaldo());
		return apiKonto;
	}

	private List<Bestand> domainBestandListToApiBestandList(
			List<de.tmosebach.slowen.buchhaltung.model.Bestand> domainBestaende) {
		
		return domainBestaende.stream()
				.map( domainBestand -> domainBestandToApiBestand(domainBestand))
				.collect(Collectors.toList());
	}

	private Bestand domainBestandToApiBestand(de.tmosebach.slowen.buchhaltung.model.Bestand domainBestand) {
		Bestand bestand = new Bestand();
		bestand.setId(Long.toString(domainBestand.getId()));
		bestand.setAsset(assetMapper.domainAssetToApiAsset(domainBestand.getAsset()));
		bestand.setKaufwert(domainBestand.getKaufwert());
		bestand.setMenge(domainBestand.getMenge());
		return bestand;
	}

	public de.tmosebach.slowen.buchhaltung.model.Konto apiKontoToDomainKonto(Konto apiKonto) {
		de.tmosebach.slowen.buchhaltung.model.Konto domainKonto = new de.tmosebach.slowen.buchhaltung.model.Konto();
		domainKonto.setId(nonNull(apiKonto.getId())?Long.valueOf(apiKonto.getId()):null);
		domainKonto.setArt(apiKonto.getArt());
		domainKonto.setName(apiKonto.getName());
		return domainKonto;
	}

	public Depot apiDepotToDomainDepot(de.tmosebach.slowen.buchhaltung.api.Depot depot) {
		de.tmosebach.slowen.buchhaltung.model.Depot domainDepot =
				new de.tmosebach.slowen.buchhaltung.model.Depot();
		domainDepot.setName(depot.getName());
		domainDepot.setArt(depot.getArt());
		return domainDepot;
	}
}
