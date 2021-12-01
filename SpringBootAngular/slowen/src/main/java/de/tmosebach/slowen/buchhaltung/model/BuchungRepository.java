package de.tmosebach.slowen.buchhaltung.model;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
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
	@Query("select b from Buchung b join b.umsaetze u where u.konto.id = :kontoId order by u.valuta desc, b.id desc ")
	Page<Buchung> findByKonto(Long kontoId, Pageable pageable );

	@Query("select count(b) from Buchung b join b.umsaetze u where u.konto.id = :kontoId")
	int countKontoBuchungenByKonto(Long kontoId);
}
