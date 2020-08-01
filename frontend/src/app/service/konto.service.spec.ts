import { TestBed } from '@angular/core/testing';

import { KontoService } from './konto.service';

describe('KontoService', () => {
  let service: KontoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KontoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
