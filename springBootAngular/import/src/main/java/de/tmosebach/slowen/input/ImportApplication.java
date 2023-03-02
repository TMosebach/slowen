package de.tmosebach.slowen.input;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.DefaultParser;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.Options;
import org.mybatis.spring.annotation.MapperScan;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication(scanBasePackages = { "de.tmosebach.slowen" })
@MapperScan({
	"de.tmosebach.slowen.assets",
	"de.tmosebach.slowen.konten",
	"de.tmosebach.slowen.buchhaltung"
})
public class ImportApplication {
	
	private static final Logger LOG = LoggerFactory.getLogger(ImportApplication.class);
	
	private static final String ARG_MODUS = "m";
	private static final String ARG_FILE = "f";

	public static void main(String[] args) {
		SpringApplication.run(ImportApplication.class, args);
	}

	private KontoImport kontoImport;
	private BuchungImport buchungImport;

	public ImportApplication(KontoImport kontoImport, BuchungImport buchungImport) {
		this.kontoImport = kontoImport;
		this.buchungImport = buchungImport;
	}

	@Bean
	public CommandLineRunner importer() {
		return args -> {
			Options options = new Options();
			options.addRequiredOption(ARG_MODUS, "modus", true, "Modus of Import. Values are Konto,Buchung");
			options.addRequiredOption(ARG_FILE, "file", true, "File to be imported");
			
			CommandLineParser parser = new DefaultParser();
		    CommandLine cmd = parser.parse( options, args);
		    
		    if (!cmd.hasOption(ARG_FILE) || !cmd.hasOption(ARG_MODUS) ) {
		    	HelpFormatter formatter = new HelpFormatter();
			    formatter.printHelp("Import Application", options);
		    }
		    
		    String fileName = cmd.getOptionValue(ARG_FILE);
		    ImportModus modus = ImportModus.valueOf(cmd.getOptionValue(ARG_MODUS));
		    LOG.info("Start Import of Typ '{}' with file '{}'", modus, fileName);
		    
		    Path path = Paths.get(fileName);
		    if (!path.toFile().exists()) {
		    	LOG.error("Kann Datei {} nicht finden.", fileName);
		    }
		    
		    if (modus == ImportModus.Konto) {
		    	kontoImport.doImport(path);
		    } else {
		    	buchungImport.doImport(path);
		    }
		};
	}
}
