package de.tmosebach.slowen.api;

import static org.apache.commons.lang3.StringUtils.isBlank;
import static java.util.Objects.isNull;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import de.tmosebach.slowen.api.input.KontoInput;
import de.tmosebach.slowen.domain.Konto;
import de.tmosebach.slowen.domain.KontoService;
import de.tmosebach.slowen.values.KontoArt;

@Service
// XXX Validierung sollte auf ein Standardverfahren geändert werden (Spring oder Jakarta?)
public class InputValidator {
	
	private KontoService kontoService;

	public InputValidator(KontoService kontoService) {
		this.kontoService = kontoService;
	}

	public List<String> validate(KontoInput kontoInput) {
		List<String> errors = new ArrayList<>();
		checkNotNull(kontoInput.getArt(), "Art", errors);
		checkNotNull(kontoInput.getBilanzPosition(), "BilanzPosition", errors);
		checkNotBlank(kontoInput.getName(), "Name", errors);
		
		if (KontoArt.Konto == kontoInput.getArt()) {
			checkSize(kontoInput.getWaehrung(), 3, "Währung", errors);
		}
		
		checkUnikat(kontoInput.getName(), errors);
		
		return errors;
	}

	private void checkUnikat(String kontoName, List<String> errors) {
		Optional<Konto> kontoOptional = kontoService.findByName(kontoName);
		if (kontoOptional.isPresent()) {
			errors.add("Konto "+kontoName+" existiert bereits.");
		}
	}

	private void checkSize(String str, int sollLaenge, String feldName, List<String> errors) {
		if (isBlank(str) || str.length() != sollLaenge) {
			errors.add("Feld "+ feldName + " hat nicht Länge von "+sollLaenge+" Zeichen.");
		}
	}

	private void checkNotBlank(String str, String feldName, List<String> errors) {
		if (isBlank(str)) {
			errors.add("Feld "+ feldName + " ist nicht gefüllt.");
		}
	}

	private void checkNotNull(Object feld, String feldName, List<String> errors) {
		if (isNull(feld)) {
			errors.add("Feld "+ feldName + " ist nicht gefüllt.");
		}
	}
}
