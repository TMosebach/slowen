package de.tmosebach.slowen.api.input;

import java.math.BigDecimal;

public interface Bestandsvorgang {

	String getDepot();

	void setDepot(String depot);

	String getAsset();

	void setAsset(String asset);

	BigDecimal getMenge();

	void setMenge(BigDecimal menge);

}