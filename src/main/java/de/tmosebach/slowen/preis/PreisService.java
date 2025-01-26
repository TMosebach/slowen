package de.tmosebach.slowen.preis;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class PreisService {
	
	private static final Logger LOG = LoggerFactory.getLogger(PreisService.class);
	
	private PreisRepository preisRepository;

	public PreisService(PreisRepository preisRepository) {
		this.preisRepository = preisRepository;
	}

	public void merge(Preis preis) {
		Optional<Preis> result = preisRepository.getLetztenPreis(preis.getReferenz());
		if (result.isEmpty()) {
			preisRepository.savePreis(preis);
		} else {
			LOG.info("Preis ist bekannt: {}", preis);
		}
	}
	
	public Optional<Preis> getLetztenPreis(String referenz) {
		return preisRepository.getLetztenPreis(referenz);
	}
}
