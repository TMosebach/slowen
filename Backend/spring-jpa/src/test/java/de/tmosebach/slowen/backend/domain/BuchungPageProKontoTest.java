package de.tmosebach.slowen.backend.domain;

import static java.math.BigDecimal.valueOf;
import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class BuchungPageProKontoTest {
	
	private final LocalDate valutaBasis = LocalDate.of(2021, 10, 1);
	
	@Autowired
	private BuchhaltungServiceJpa impl;

	@Test
	void testBuchungsseite_in_korrekter_Reihenfolge_lesen() {
		
		Long giroId = createBuchungen();
		
		Page<Buchung> page = impl.findBuchungenByKonto(giroId, 0, 6);
		assertEquals(20, page.getTotalElements());
		assertEquals(4, page.getTotalPages());
		
		List<Buchung> content = page.getContent();
		assertEquals(6, content.size());
		assertEquals(valutaBasis.plusDays(20), content.get(0).getUmsaetze().get(0).getValuta() );
		assertEquals(valutaBasis.plusDays(15), content.get(5).getUmsaetze().get(0).getValuta() );
				
		page = impl.findBuchungenByKonto(giroId, 3, 6);
		content = page.getContent();
		assertEquals(2, content.size());
		assertEquals(valutaBasis.plusDays(1), content.get(1).getUmsaetze().get(0).getValuta() );
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	private Long createBuchungen() {
		Konto giro = new Konto();
		giro.setName("Giro");
		giro = impl.kontoAnlegen(giro);
		
		Konto tagesgeld = new Konto();
		tagesgeld.setName("Tagesgeld");
		tagesgeld = impl.kontoAnlegen(tagesgeld);
		
		for (int i = 0; i < 20; i++) {
			
			LocalDate valuta = valutaBasis.plusDays(i+1);

			Umsatz giroUmsatz = new Umsatz();
			giroUmsatz.setKonto(giro);
			giroUmsatz.setValuta(valuta);
			giroUmsatz.setBetrag(valueOf(-i-1));

			Umsatz tagesgeldUmsatz = new Umsatz();
			tagesgeldUmsatz.setKonto(tagesgeld);
			tagesgeldUmsatz.setValuta(valuta);
			tagesgeldUmsatz.setBetrag(valueOf(i+1));
			
			Buchung buchung = new Buchung();
			buchung.setVerwendung("Sparen " + 1);
			buchung.addUmsatz(giroUmsatz);
			buchung.addUmsatz(tagesgeldUmsatz);
			
			impl.buchen(buchung);
		}

		return giro.getId();
	}
}
