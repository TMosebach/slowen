/**
 * Tokenize a CSV line respecting quotes and specified delimiter.
 */
export function tokenizeCsvLine(line: string, delimiter: string): string[] {
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

/**
 * Split CSV content into tokenized row arrays.
 */
export function parseCsvRows(content: string, customDelimiter?: string): string[][] {
  const rawLines = content
    .split(/\r\n|\n|\r/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (rawLines.length === 0) {
    return [];
  }

  const delimiter = customDelimiter || detectDelimiter(rawLines[0]);
  return rawLines.map(line => tokenizeCsvLine(line, delimiter));
}

/**
 * Auto-detect delimiter from line.
 */
export function detectDelimiter(line: string): string {
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

/**
 * Parse German/ISO date format to ISO date string (YYYY-MM-DD).
 * Supports DD.MM.YYYY, DD.MM.YY, YYYY-MM-DD.
 */
export function parseDateToIso(rawDate: string): string {
  if (!rawDate) {
    return new Date().toISOString().split('T')[0];
  }

  const cleaned = rawDate.trim();

  // Already ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  // DD.MM.YYYY
  const germanMatch = cleaned.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (germanMatch) {
    const day = germanMatch[1].padStart(2, '0');
    const month = germanMatch[2].padStart(2, '0');
    const year = germanMatch[3];
    return `${year}-${month}-${day}`;
  }

  // DD.MM.YY
  const germanShortMatch = cleaned.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/);
  if (germanShortMatch) {
    const day = germanShortMatch[1].padStart(2, '0');
    const month = germanShortMatch[2].padStart(2, '0');
    const year = parseInt(germanShortMatch[3], 10) < 70 ? `20${germanShortMatch[3]}` : `19${germanShortMatch[3]}`;
    return `${year}-${month}-${day}`;
  }

  // Fallback try Date.parse
  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
}

/**
 * Parse German or standard amount string to number.
 * e.g. "1.234,56" -> 1234.56, "-49,90" -> -49.90, "+ 1.000,00" -> 1000.00
 */
export function parseAmount(rawAmount: string): number {
  if (!rawAmount) {
    return 0;
  }

  let cleaned = rawAmount.trim().replace(/\s+/g, '').replace(/[^\d,.\-+]/g, '');

  if (!cleaned) {
    return 0;
  }

  // German format with comma as decimal: 1.234,56 or 1234,56 or -45,00
  if (cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  }

  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : Math.round(val * 100) / 100;
}
