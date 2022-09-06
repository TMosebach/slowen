package de.tmosebach.slowen;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan({
	"de.tmosebach.slowen.assets",
	"de.tmosebach.slowen.konten",
	"de.tmosebach.slowen.buchhaltung"
})
public class SlowenApplication {

	public static void main(String[] args) {
		SpringApplication.run(SlowenApplication.class, args);
	}

}
