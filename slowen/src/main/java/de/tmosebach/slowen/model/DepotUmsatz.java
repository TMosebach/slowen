package de.tmosebach.slowen.model;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.DiscriminatorColumn;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@DiscriminatorColumn(name="UMSATZ_TYPE")
@DiscriminatorValue("D")
@Entity
public class DepotUmsatz extends KontoUmsatz {
	
	public DepotUmsatz() {
		type = "D";
	}

	@Column(name="UMSATZ_TYPE", insertable = false, updatable = false)
	protected String type;
	
	@Column(nullable = false)
	private BigDecimal stuecke;
	
	@ManyToOne
	@JoinColumn(name = "bestand_id", nullable = false, updatable = false)
	private Bestand bestand;

	public BigDecimal getStuecke() {
		return stuecke;
	}

	public void setStuecke(BigDecimal stuecke) {
		this.stuecke = stuecke;
	}
}
