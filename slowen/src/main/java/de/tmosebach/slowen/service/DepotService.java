package de.tmosebach.slowen.service;

import org.springframework.stereotype.Service;

import de.tmosebach.slowen.exception.UnkownEntityException;
import de.tmosebach.slowen.model.Depot;
import de.tmosebach.slowen.repository.DepotRepository;

@Service
public class DepotService {
	
	private DepotRepository depotRepository;
	
	public DepotService(DepotRepository depotRepository) {
		this.depotRepository = depotRepository;
	}

	public Depot findById(Long id) throws UnkownEntityException {
		return depotRepository.findById(id).orElseThrow( () -> new UnkownEntityException("Unbekannte Depot-Id ", id));
	}

}
