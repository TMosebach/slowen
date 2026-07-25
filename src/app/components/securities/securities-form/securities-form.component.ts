import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { SecuritiesService } from '../../../services/securities.service';
import { Security, SECURITY_TYPES, FAELLIGKEIT_TYPES } from '../../../models/security.model';

@Component({
  selector: 'app-securities-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './securities-form.component.html',
  styleUrls: ['./securities-form.component.scss']
})
export class SecuritiesFormComponent implements OnInit {
  security: Security = {
    name: '',
    type: 'Aktie',
    isin: '',
    wkn: '',
    faelligkeit: ''
  };

  securityTypes = SECURITY_TYPES;
  showFaelligkeit = false;
  isEditing = false;
  securityId: number | null = null;
  saving = false;
  errorMessage: string | null = null;

  constructor(
    private securitiesService: SecuritiesService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.securityId = parseInt(id, 10);
      this.loadSecurity();
    } else {
      this.updateFaelligkeitVisibility();
    }
  }

  async loadSecurity() {
    if (this.securityId) {
      const security = await this.securitiesService.getById(this.securityId);
      if (security) {
        this.security = security;
        this.updateFaelligkeitVisibility();
      }
      this.cdr.detectChanges();
    }
  }

  updateFaelligkeitVisibility() {
    this.showFaelligkeit = FAELLIGKEIT_TYPES.includes(this.security.type);
  }

  formatISIN(value: string): string {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  formatWKN(value: string): string {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  async onSubmit() {
    this.errorMessage = null;

    if (!this.security.name || this.security.name.trim().length === 0) {
      this.errorMessage = 'Name ist erforderlich.';
      return;
    }

    if (!this.security.isin || this.security.isin.length !== 12) {
      this.errorMessage = 'ISIN muss 12 Zeichen sein.';
      return;
    }

    if (!this.security.wkn || this.security.wkn.length !== 6) {
      this.errorMessage = 'WKN muss 6 Zeichen sein.';
      return;
    }

    if (this.showFaelligkeit && !this.security.faelligkeit) {
      this.errorMessage = 'Fälligkeit ist erforderlich.';
      return;
    }

    this.saving = true;
    try {
      if (this.isEditing && this.securityId) {
        await this.securitiesService.update(this.securityId, this.security);
        alert('Wertpapier aktualisiert');
      } else {
        await this.securitiesService.create(this.security);
        alert('Wertpapier erstellt');
      }
      this.router.navigate(['/securities']);
    } catch (err: any) {
      console.error('Failed to save security:', err);
      this.errorMessage = err.message || 'Fehler beim Speichern des Wertpapiers.';
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  onCancel() {
    this.router.navigate(['/securities']);
  }
}
