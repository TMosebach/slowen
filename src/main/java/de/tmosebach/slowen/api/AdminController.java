package de.tmosebach.slowen.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import de.tmosebach.slowen.backup.AdminService;

@RestController
public class AdminController {
	
	private AdminService adminService;

	public AdminController(AdminService adminService) {
		this.adminService = adminService;
	}

	@GetMapping("api/export")
	public String exportDb() {
		return adminService.exportDb();
	}
	
	@GetMapping("api/import")
	public String importDb() {
		return adminService.importDb();
	}
}
