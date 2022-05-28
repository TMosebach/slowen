export interface Link {

}

export interface Page<T> {
    _embbedded: T[];
    _links: Link[];
    page: {
        size: number;
        totalElements: number;
        totalPages: number;
        number: number;
    }
}
