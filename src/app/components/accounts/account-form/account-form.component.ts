import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { Account, ACCOUNT_SUBTYPES } from '../../../models/account.model';

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './account-form.component.html'
})
export class AccountFormComponent implements OnInit {
  account: Account = {
    name: '',
    type: 'Bestand',
    subtype: '',
    iban: '',
    notes: ''
  };

  subtypes: readonly string[] = ACCOUNT_SUBTYPES['Bestand'];
  isEditing = false;
  accountId: number | null = null;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.accountId = parseInt(id, 10);
      this.loadAccount();
    }
  }

  async loadAccount() {
    if (this.accountId) {
      const account = await this.accountService.getById(this.accountId);
      if (account) {
        this.account = account;
        this.updateSubtypes();
      }
    }
  }

  updateSubtypes() {
    this.subtypes = ACCOUNT_SUBTYPES[this.account.type] || [];
    if (!this.subtypes.includes(this.account.subtype)) {
      this.account.subtype = '';
    }
  }

  showIbanField(): boolean {
    return this.account.type === 'Bestand' && 
           ['Giro', 'Tagesgeld', 'Depot'].includes(this.account.subtype);
  }

  async onSubmit() {
    if (!this.account.name || this.account.name.length < 3) {
      alert('Name muss mindestens 3 Zeichen lang sein.');
      return;
    }

    if (!this.account.subtype) {
      alert('Bitte wählen Sie einen Subtyp.');
      return;
    }

    if (this.isEditing && this.accountId) {
      await this.accountService.update(this.accountId, this.account);
    } else {
      await this.accountService.create(this.account);
    }
    this.router.navigate(['/accounts']);
  }
}
