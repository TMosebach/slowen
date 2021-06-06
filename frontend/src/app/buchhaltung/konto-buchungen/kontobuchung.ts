export interface Kontobuchung {
    verwendung?: string;
    empfaenger?: string;
    konto: string;
    valuta: string;
    ausgabe?: number;
    einnahme?: number;
}
