package de.tmosebach.slowen;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api")
public class SlowenControler {

	@GetMapping("hello")
	public String testApi() {
		return "Hello";
	}
}
