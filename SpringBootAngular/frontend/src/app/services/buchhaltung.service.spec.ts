import { TestBed } from '@angular/core/testing';

import { BuchhaltungService } from './buchhaltung.service';

describe('BuchhaltungService', () => {
  let service: BuchhaltungService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuchhaltungService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
