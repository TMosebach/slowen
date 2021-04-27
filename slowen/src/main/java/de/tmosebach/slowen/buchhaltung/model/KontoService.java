package de.tmosebach.slowen.buchhaltung.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class KontoService {
	
	public static final String KONTO_KURSGEWINN = "Kursgewinn";
	public static final String KONTO_KURSVERLUST = "Kursverlust";
	
	@Autowired
	private KontoRepository kontoRepository;
	
	@Autowired
	private DepotRepository depotRepository;

	public List<Konto> findAll() {
		List<Konto> result = new ArrayList<>();
		kontoRepository.findAll().forEach( k -> result.add(k));
		return result;
	}
	
	public Optional<Konto> findById(Long kontoId) {
		return kontoRepository.findById(kontoId);
	}
	
	public Optional<Konto> findByName(String kontoName) {
		return kontoRepository.findByName(kontoName);
	}
	
	@Transactional
	public Konto createKonto(Konto konto) {
		kontoRepository.save(konto);
		return konto;
	}
	
	@Transactional
	public Depot createDepot(Depot depot) {
		depotRepository.save(depot);
		return depot;
	}

	public void update(Konto konto) {
		kontoRepository.save(konto);
	}

	public Konto getKursgewinn() {
		return findByName(KONTO_KURSGEWINN).get();
	}
	
	public Konto getKursverlust() {
		return findByName(KONTO_KURSVERLUST).get();
	}
}
