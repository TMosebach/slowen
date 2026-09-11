import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { Account } from '../../models/account.model';

export type ImportType = 'Umsatz' | 'Depot-Bestand';
export type Institution = 'ING' | 'Comdirect' | 'Deutsche Bank';

export interface ParsedCsvData {
  headers: string[];
  rows: string[][];
  rawRowCount: number;
}

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './import.component.html'
})
export class ImportComponent implements OnInit {
  step: 1 | 2 = 1;

  importType: ImportType = 'Umsatz';
  institution: Institution = 'ING';
  selectedAccountId: number | null = null;
  selectedFile: File | null = null;
  selectedFileName = '';

  institutions: Institution[] = ['ING', 'Comdirect', 'Deutsche Bank'];
  accounts: Account[] = [];
  loadingAccounts = false;
  accountError: string | null = null;

  isReadingFile = false;
  parseError: string | null = null;
  parsedCsv: ParsedCsvData | null = null;

  constructor(
    private accountService: AccountService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  async loadAccounts(): Promise<void> {
    this.loadingAccounts = true;
    this.accountError = null;
    try {
      this.accounts = await this.accountService.getAll();
      this.ensureValidAccountSelection();
    } catch (err) {
      console.error('Failed to load accounts for import:', err);
      this.accountError = 'Konten konnten nicht geladen werden.';
    } finally {
      this.loadingAccounts = false;
      this.cdr.detectChanges();
    }
  }

  get availableAccounts(): Account[] {
    if (this.importType === 'Depot-Bestand') {
      return this.accounts.filter(acc => acc.subtype === 'Depot');
    }
    return this.accounts.filter(acc => acc.subtype !== 'Depot');
  }

  onImportTypeChange(): void {
    this.ensureValidAccountSelection();
  }

  private ensureValidAccountSelection(): void {
    const available = this.availableAccounts;
    if (this.selectedAccountId !== null) {
      const stillValid = available.some(acc => acc.id === this.selectedAccountId);
      if (!stillValid) {
        this.selectedAccountId = available.length > 0 ? (available[0].id ?? null) : null;
      }
    } else if (available.length > 0) {
      this.selectedAccountId = available[0].id ?? null;
    }
  }

  get selectedAccount(): Account | undefined {
    return this.accounts.find(acc => acc.id === this.selectedAccountId);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
      this.parseError = null;
    } else {
      this.selectedFile = null;
      this.selectedFileName = '';
    }
  }

  get canLoad(): boolean {
    return (
      !!this.importType &&
      !!this.institution &&
      this.selectedAccountId !== null &&
      this.selectedAccountId !== 0 &&
      !!this.selectedFile &&
      !this.isReadingFile
    );
  }

  async onLoadCsv(): Promise<void> {
    if (!this.canLoad || !this.selectedFile) {
      return;
    }

    this.isReadingFile = true;
    this.parseError = null;

    try {
      const content = await this.readFileContent(this.selectedFile);
      const parsed = this.parseCsv(content);
      if (parsed.rows.length === 0 && parsed.headers.length === 0) {
        throw new Error('Die CSV-Datei enthält keine lesbaren Daten.');
      }
      this.parsedCsv = parsed;
      this.step = 2;
    } catch (err: any) {
      console.error('Failed to parse CSV:', err);
      this.parseError = err?.message || 'Fehler beim Einlesen der CSV-Datei.';
    } finally {
      this.isReadingFile = false;
      this.cdr.detectChanges();
    }
  }

  onFinish(): void {
    this.step = 1;
    this.parsedCsv = null;
    this.selectedFile = null;
    this.selectedFileName = '';
  }

  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei.'));
      reader.readAsText(file);
    });
  }

  parseCsv(content: string): ParsedCsvData {
    const lines = content
      .split(/\r\n|\n|\r/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      return { headers: [], rows: [], rawRowCount: 0 };
    }

    // Detect delimiter (; or , or \t)
    const delimiter = this.detectDelimiter(lines[0]);
    const parsedRows = lines.map(line => this.parseCsvLine(line, delimiter));

    const headers = parsedRows[0];
    const rows = parsedRows.slice(1);

    return {
      headers,
      rows,
      rawRowCount: lines.length
    };
  }

  private detectDelimiter(line: string): string {
    const semicolons = (line.match(/;/g) || []).length;
    const commas = (line.match(/,/g) || []).length;
    const tabs = (line.match(/\t/g) || []).length;

    if (semicolons >= commas && semicolons >= tabs && semicolons > 0) {
      return ';';
    }
    if (tabs > semicolons && tabs > commas) {
      return '\t';
    }
    return ',';
  }

  private parseCsvLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }
}
