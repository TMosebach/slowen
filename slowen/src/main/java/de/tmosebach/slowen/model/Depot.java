package de.tmosebach.slowen.model;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@DiscriminatorValue("D")
@Entity
public class Depot extends Konto {

}
