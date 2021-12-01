package de.tmosebach.slowen.buchhaltung.model;

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

@Entity
public class Buchung {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(length = 40)
	@Size(max = 40)
	private String verwendung;
	
	@Column(length = 40)
	@Size(max = 40)
	private String empfaenger;

	@OneToMany(mappedBy = "buchung", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
	private List<KontoUmsatz> umsaetze = new ArrayList<>();
	
	public void addUmsatz(KontoUmsatz umsatz) {
		getUmsaetze().add(umsatz);
		umsatz.setBuchung(this);
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getVerwendung() {
		return verwendung;
	}

	public void setVerwendung(String verwendung) {
		this.verwendung = verwendung;
	}

	public String getEmpfaenger() {
		return empfaenger;
	}

	public void setEmpfaenger(String empfaenger) {
		this.empfaenger = empfaenger;
	}

	public List<KontoUmsatz> getUmsaetze() {
		return umsaetze;
	}

	public void setUmsaetze(List<KontoUmsatz> umsaetze) {
		this.umsaetze = umsaetze;
	}
}
