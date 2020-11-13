package de.tmosebach.slowen.model;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.validation.constraints.Size;

import lombok.Data;
import lombok.ToString;

@Data
@Entity
public class Buchung {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	/* FIXME
	@Enumerated(EnumType.STRING)
	private Vorgang vorgang;
	*/
	
	@ToString.Exclude
	@OneToMany(mappedBy = "buchung", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
	private List<KontoUmsatz> umsaetze = new ArrayList<>();
	
	@Column(length = 40)
	@Size(max = 40)
	private String verwendung;
	
	@Column(length = 40)
	@Size(max = 40)
	private String empfaenger;
	
	public void addKontoUmsatz(KontoUmsatz kontoUmsatz) {
		getUmsaetze().add(kontoUmsatz);
		kontoUmsatz.setBuchung(this);
	}
}
