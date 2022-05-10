import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { from, of } from 'rxjs';

import { KontodetailsComponent } from './kontodetails.component';

describe('KontodetailsComponent', () => {
  let component: KontodetailsComponent;
  let fixture: ComponentFixture<KontodetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      declarations: [ KontodetailsComponent ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({name: 'Giro'}),
          },
        },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KontodetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
