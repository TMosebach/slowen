export interface Kontobuchung {
    verwendung?: string;
    empfaenger?: string;
    konto?: string;
    valuta: Date;
    ausgabe?: number;
    einnahme?: number;
}
