package de.tmosebach.slowen.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import de.tmosebach.slowen.model.Buchung;

public interface BuchungRepository extends CrudRepository<Buchung, Long> {
	
	/**
	 * Seitenweise Lesen der Buchungen eines Kontos.
	 * 
	 * Die Seiten sind nach Valuta in absteigender Reihenfolge sortiert, so dass die jüngsten Buchungen bzgl. 
	 * der Valuta als erstes kommen. Bei identischer Valuta ergibt sich die Reihenfolge aus der Buchungs-Id.
	 * Auch hier die jünsten Buchungen zuerst (größere Id).
	 * 
	 * @param kontoName Name des gewünschten Kontos
	 * @param pageable Page-Metadaten
	 * @return Page-Objekt mit den gefundenen Buchungen.
	 */
	@Query("select b from Buchung b join b.umsaetze u where u.konto.name = :kontoName order by u.valuta desc, b.id desc ")
	Page<Buchung> findByKonto(String kontoName, Pageable pageable );
}
