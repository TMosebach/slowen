package de.tmosebach.slowen.converter;

import java.io.IOException;
import java.io.Writer;
import java.util.stream.Stream;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;

import de.tmosebach.slowen.converter.mapper.IngMapper;

public class IngConverter {

	/**
	 * Kopfzeilen für ING-Csv-Dateien
	 */
	private int offeneKopfzeilen = 14;
	
	private String zielKonto;
	private ObjectMapper objectMapper;
	
	private JsonGenerator generator;

	public IngConverter(String zielKonto, ObjectMapper objectMapper) {
		this.zielKonto = zielKonto;
		this.objectMapper = objectMapper;
	}

	public void convert(Stream<String> lines, Writer writer) {
		try {
			generator = objectMapper.createGenerator(writer);
			
			lines.filter( this::isDatenzeile )
				.map( this::toFields )
				.forEach( buchung -> toBuchung(buchung, writer) );
		} catch (IOException e) {
			throw new RuntimeException(e.getMessage());
		}
	}
	
	private void toBuchung(String[] fields, Writer writer) {
		try {
			writer.append("TODO: ");
			
			generator.writeObject(IngMapper.map(zielKonto, fields));
			
			writer.append(System.lineSeparator());
		} catch (IOException e) {
			throw new RuntimeException(e.getMessage());
		}
	}
	
	private String[] toFields(String line) {
		return line.split(";");
	}

	private boolean isDatenzeile(String line) {
		if (offeneKopfzeilen > 0) {
			offeneKopfzeilen--;
			return false;
		}
		return true;
	}
	
	protected String extractIsin(String verwendung) {
		int indexIsin = verwendung.indexOf("ISIN");
		if (indexIsin >= 0) {
			return verwendung.substring(indexIsin+5, indexIsin+17);
		}
		return "";
	}
}
