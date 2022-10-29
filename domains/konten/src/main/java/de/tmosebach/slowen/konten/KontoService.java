package de.tmosebach.slowen.konten;

import static de.tmosebach.slowen.shared.values.Functions.createId;
import static java.util.Objects.isNull;
import static org.apache.commons.lang3.StringUtils.isBlank;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import de.tmosebach.slowen.shared.values.KontoIdentifier;

@Service
public class KontoService {

	private KontoRepository kontoRepository;

	public KontoService(KontoRepository kontoRepository) {
		this.kontoRepository = kontoRepository;
	}
	
	public Konto createKonto(KontoType type,String name, BilanzType bilanzType) {
		
		if (isBlank(name)) {
			throw new IllegalArgumentException("Name fehlt.");
		}
		
		if (isNull(bilanzType)) {
			throw new IllegalArgumentException("Bilanz-Type fehlt.");
		}
		
		String id = createId();
		KontoIdentifier identifier = new KontoIdentifier(id);
		Konto konto;
		if (type == KontoType.Depot) {
			konto = new Depot(identifier, name, BilanzType.Bestand);
		} else {
			konto = new SimpleKonto(identifier, name, bilanzType);
		}
		kontoRepository.save(konto);
		
		return konto;
	}
	
	public List<Konto> findKonten() {
		return kontoRepository.findKonten();
	}

	public Optional<Konto> findById(KontoIdentifier konto) {
		return kontoRepository.findById(konto);
	}

	public void update(Konto konto) {
		kontoRepository.update(konto);
	}

	public void merge(Bestand bestand) {
		kontoRepository.merge(bestand);
	}

	public Optional<Konto> findByName(String name) {
		return kontoRepository.findByName(name);
	}
}
