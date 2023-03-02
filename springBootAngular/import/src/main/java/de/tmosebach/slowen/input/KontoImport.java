package de.tmosebach.slowen.input;

import static java.util.Objects.requireNonNull;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

import org.springframework.stereotype.Component;

import de.tmosebach.slowen.konten.BilanzType;
import de.tmosebach.slowen.konten.KontoService;
import de.tmosebach.slowen.konten.KontoType;

@Component
public class KontoImport {

	private KontoService kontoService;

	public KontoImport(KontoService kontoService) {
		this.kontoService = kontoService;
	}
	
	public void doImport(Path path) {
		final NotFirstFilter notFirstFilter = new NotFirstFilter();

		try (Stream<String> stream = Files.lines(path)) {
			stream
			.filter( line -> notFirstFilter.notFirst(line) )
			.map( line -> line.split(";") )
			.map( spalten -> valitateAndMap(spalten) )
			.forEach( konto -> kontoService.createKonto( (KontoType)konto[0], konto[1].toString(), (BilanzType)konto[2]) );
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	private Object[] valitateAndMap(String[] spalten) {
		
		Object[] result = new Object[3];
		result[0] = KontoType.valueOf(requireNonNull(spalten[0]));
		result[1] = requireNonNull(spalten[1]);
		result[2] = BilanzType.valueOf(requireNonNull(spalten[2]));
		
		return result;
	}
}
