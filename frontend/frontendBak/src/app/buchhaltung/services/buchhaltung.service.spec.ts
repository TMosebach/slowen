import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BuchhaltungService } from './buchhaltung.service';

describe('BuchhaltungService', () => {
  let service: BuchhaltungService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ]
    });

    await TestBed.compileComponents();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuchhaltungService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
