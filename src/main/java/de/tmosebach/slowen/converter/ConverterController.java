package de.tmosebach.slowen.converter;

import java.io.FileWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
public class ConverterController {
	
	private static final Logger LOG = LoggerFactory.getLogger(ConverterController.class);

	private ObjectMapper objectMapper;

	public ConverterController(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
	}

	@GetMapping("api/convert")
	public String convert(String konto, String datei, EingabeTyp typ) {
		
		LOG.trace("convert({},{},{})", konto, datei, typ);
		
		Path filePath = Paths.get(datei+".csv");
		IngConverter ingConverter = new IngConverter("ING Giro", objectMapper);
		try (Stream<String> lines = Files.lines(filePath, StandardCharsets.ISO_8859_1);
			 FileWriter writer = new FileWriter(datei+".input") ) {
			
			ingConverter.convert(lines, writer);
		} catch (Exception e) {
			LOG.error(e.getMessage(), e);
			return "Fehler: "+e.getClass().getSimpleName()+" "+ e.getMessage();
		}
		return datei + ".import";
	}
}
