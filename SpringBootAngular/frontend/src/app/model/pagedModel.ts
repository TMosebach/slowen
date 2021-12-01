import { PageMetadata } from './pageMetaData';

export interface PagedModel<T> {
    content: T[];
    page: PageMetadata;
}
