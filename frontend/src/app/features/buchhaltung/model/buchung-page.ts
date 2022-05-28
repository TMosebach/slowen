import { Buchung } from "./buchung";

interface Link {
    href: string;
}
export interface BuchhungPage {
    _embedded: {
        apiBuchungList: Buchung[];
    };
    _links: {
        self: Link,
        first: Link,
        prev: Link,
        next: Link,
        last: Link
    };
    page: {
        size: number;
        totalElements: number;
        totalPages: number;
        number: number;
    }
}